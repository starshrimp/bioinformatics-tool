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

# Optional: Load your DataFrame here or in main.py and pass it
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
    # If steps are dicts: extract the string
    if steps and isinstance(steps[0], dict) and 'step' in steps[0]:
        steps = [s['step'] for s in steps]

    # 2. Call coder agent
    code = call_coder_llm(steps, columns_str)
    code = strip_code_fences(code)

    # 3. Execute code
    buf = io.BytesIO()
    local_env = {
        'clinical_df': clinical_df,
        'plt': plt,
        'pd': pd,
        'lifelines': lifelines,   # <-- Make lifelines available in exec
        'sns': sns,
        'np': np
    }
    try:
        logger.info("----RAW LLM CODE OUTPUT----\n%s\n------------------------------", code)
        exec(code, {}, local_env)
        plot_base64 = None
        if plt.get_fignums():
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            plot_base64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')
        text_result = local_env.get('output', '')

        evaluation = call_evaluator_llm(query, steps, text_result)
        plot_explanation = None
        if plot_base64:  # Only call if plot exists!
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
        tb = traceback.format_exc()
        logger.error("Execution failed: %s\nCode:\n%s", tb, code)
        return jsonify({
            'error': f"Sorry, the analysis could not be completed due to a technical issue: {str(e)}",
            'trace': tb,         # Optionally, remove in production
            'code': code,        # Optionally, remove in production
            'retry': True        # <--- Add this flag!
        }), 200

