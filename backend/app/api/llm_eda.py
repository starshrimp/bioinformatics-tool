from flask import Blueprint, request, jsonify
import openai
import pandas as pd
import matplotlib
matplotlib.use('Agg')    
import matplotlib.pyplot as plt
import io
import base64
import os
import seaborn as sns
import numpy as np
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="/Users/sarah/Code/bioinformatics-tool/backend/.env.development")

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_full_path(relative_path):
    return os.path.join(BACKEND_ROOT, relative_path)

# Optional: Load your DataFrame here or in main.py and pass it
clinical_df = pd.read_csv(get_full_path(os.getenv("CLINICAL")))  # Adjust path

clinical_path = os.getenv("CLINICAL")
print(f"CLINICAL file path loaded: {clinical_path}")


llm_eda_api = Blueprint('llm_eda_api', __name__)

@llm_eda_api.route('/api/llm-eda', methods=['POST'])
def llm_eda():
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({'error': 'Missing query'}), 400

    # Build prompt
    columns = ', '.join([f"'{c}'" for c in clinical_df.columns])
    prompt = (
        f"You are a data scientist. The clinical metadata DataFrame (named clinical_df) is from the GSE96058 breast cancer study and contains information about thousands of breast cancer patients. "
        f"The DataFrame has columns: {columns}. "
        f"Only use information actually present in these columns to answer user queries.\n"
        f"User query: {query}\n\n"
        f"Please provide Python code (no imports needed) to answer the query. "
        f"Always return:\n"
        f"1. A variable called 'output' containing a detailed string answer (e.g., summary statistics, calculated values, or an explanation).\n"
        f"2. If appropriate, generate a plot using matplotlib (e.g., bar, histogram, etc.).\n"
        f"Do NOT use print().\n"
        f"At the end, provide a short explanation (2 sentences) of the result. "
        f"Format your response as:\n\n"
        f"```python\n<code>\n```\nExplanation: <text>"
    )





    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
            temperature=0.1,
        )
        llm_reply = response.choices[0].message.content


        # Extract code and explanation
        import re
        code_match = re.search(r"```python\n(.+?)\n```", llm_reply, re.DOTALL)
        explanation_match = re.search(r"Explanation:\s*(.+)", llm_reply, re.DOTALL)

        code = code_match.group(1) if code_match else ''
        explanation = explanation_match.group(1).strip() if explanation_match else 'No explanation.'

        local_env = {'clinical_df': clinical_df, 'plt': plt, 'pd': pd}
        buf = io.BytesIO()
        exec(code, {}, local_env)

        plot_base64 = None
        if plt.get_fignums():
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            plot_base64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')

        text_result = local_env.get('output', '')

        return jsonify({
            'plot': plot_base64,
            'text': text_result,
            'explanation': explanation,
            'code': code  # <-- add this
        })


    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({'error': f'Failed: {str(e)}', 'trace': tb}), 500
