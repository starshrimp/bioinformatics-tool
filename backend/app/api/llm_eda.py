from flask import Blueprint, request, jsonify
import openai
import pandas as pd
import matplotlib
matplotlib.use('Agg')    
import matplotlib.pyplot as plt
import io
import base64
import os
import re
import seaborn as sns
import numpy as np
import traceback
import logging
import lifelines
from dotenv import load_dotenv
from agents.planner import call_planner_llm
from agents.coder import call_coder_llm
from agents.evaluator import call_evaluator_llm, call_plot_explanation_llm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # points to /backend/app
dotenv_path = os.path.join(BACKEND_ROOT, ".env")
load_dotenv(dotenv_path=dotenv_path)



def get_full_path(relative_path):
    return os.path.join(BACKEND_ROOT, relative_path)


def truncate_table_markdown(text, max_rows=30):
    lines = text.split('\n')
    if len(lines) > max_rows + 2:  # +2 for header/sep
        return '\n'.join(lines[:max_rows+2]) + f'\n... (table truncated, showing first {max_rows} rows)'
    return text


clinical_df = pd.read_csv(get_full_path(os.getenv("CLINICAL_LLM")))  # Adjust path


llm_eda_api = Blueprint('llm_eda_api', __name__)


def strip_code_fences(code):
    match = re.search(r"```python\n(.+?)\n```", code, re.DOTALL)
    if match:
        return match.group(1)
    match = re.search(r"```(.+?)```", code, re.DOTALL)
    if match:
        return match.group(1)
    return code.strip()


@llm_eda_api.route('/api/llm-eda', methods=['POST'])
def llm_eda():
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({'error': 'Missing query'}), 400

    columns = list(clinical_df.columns)
    columns_str = ', '.join([f"'{c}'" for c in columns])

    # 1. Call planner agent
    plan = call_planner_llm(query, columns_str)
    steps = plan['steps'] if isinstance(plan, dict) and 'steps' in plan else plan
    if steps and isinstance(steps[0], dict) and 'step' in steps[0]:
        steps = [s['step'] for s in steps]

    # Retry loop for code generation and execution
    max_attempts = 3
    attempt = 0
    error_message = None
    code = None

    while attempt < max_attempts:
        if attempt == 0:
            # First attempt: send original prompt to coder llm
            code = call_coder_llm(steps, columns_str)
        else:
            # On retry, send the original prompt, failed code, and error message
            retry_prompt = (
                f"The following code failed to execute for the prompt: '{query}'.\n"
                f"Error message:\n{error_message}\n"
                f"Please fix the code below:\n{code}"
            )
            code = call_coder_llm([retry_prompt], columns_str)
            logger.info("----------------------------------------------------------Retry prompt:----\n%s\n-----------------------------", retry_prompt)
        code = strip_code_fences(code)

        buf = io.BytesIO()
        local_env = {
            'clinical_df': clinical_df,
            'plt': plt,
            'pd': pd,
            'lifelines': lifelines,
            'sns': sns,
            'np': np
        }
        try:
            logger.info("----RAW LLM CODE OUTPUT----\n%s\n------------------------------", code)

            # Execute the code in a local environment
            exec(code, {}, local_env)
            plot_base64 = None
            if plt.get_fignums():
                plt.savefig(buf, format='png')
                plt.close()
                buf.seek(0)
                plot_base64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')

            text_result = local_env.get('output', '')
            if "| KM_estimate" in text_result:
                text_result = truncate_table_markdown(text_result)

            # last step: call evaluator llm
            evaluation = call_evaluator_llm(query, steps, text_result)
            plot_explanation = None
            if plot_base64:
                plot_explanation = call_plot_explanation_llm(query, text_result, steps)

            return jsonify({
                'plot': plot_base64,
                'text': text_result,
                'code': code,
                'steps': steps,
                'evaluation': evaluation,
                'plot_explanation': plot_explanation
            })
        except Exception as e:
            # logs the error and traceback
            tb = traceback.format_exc()
            logger.error("Execution failed (attempt %d): %s\nCode:\n%s", attempt+1, tb, code)
            error_message = f"{str(e)}\n{tb}"
            attempt += 1

    # If all attempts fail, return error to frontend
    return jsonify({
        'error': f"Sorry, the analysis could not be completed after {max_attempts} attempts.",
        'trace': error_message,
        'code': code,
        'retry': False
    }), 200