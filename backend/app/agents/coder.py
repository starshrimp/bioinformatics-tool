import openai
import os
import json

def call_coder_llm(steps, columns):
    """
    Given a list of analysis steps and available data columns,
    generate Python code to execute all the steps on a DataFrame called 'clinical_df'.
    Return only the code (no explanations, no markdown).
    """
    prompt = (
        "You are a Python data analyst. Given the following data analysis steps and available columns, "
        "generate Python code to accomplish all steps. The DataFrame is called 'clinical_df'.\n\n"

        "IMPORTANT:\n"
        "• For every analysis, assign the main result (tables, statistics, key numbers) to a variable called 'output', formatted as a readable multi-line string.\n"
        "• Use markdown tables (e.g., .to_markdown() or .to_string(index=False)) for tables, f-strings for numbers, and add headings and line breaks.\n"
        "• When selecting multiple columns (especially after groupby or in general), ALWAYS use a list of columns (square brackets) like clinical_df[['col1', 'col2']]. Never use a tuple.\n"
        "• Do not use packages that are not already imported or installed. Only use pandas, numpy, scipy, matplotlib, lifelines, and seaborn.\n"
        "• NEVER use plt.savefig() with a file path—never save plots to disk. Just generate the plot. The system will capture and display the current figure automatically.\n"
        "• For summary statistics, select only a small number of clinically relevant columns, not all columns. Always show summary statistics as a transposed table (variables as rows, stats as columns) using .describe().T.to_markdown().\n"
        "• For each categorical column, display value counts as a markdown table (use .value_counts().to_frame().to_markdown()).\n"
        "• If a step asks for a plot or visualization, always generate a matplotlib or seaborn plot as well, but do NOT save it to disk or assign a string like 'Box Plot Saved...'.\n"
        "• Never use print(). Never just define variables—always assign the summary to 'output'.\n"
        "• If there are multiple steps, concatenate the summaries for all steps into 'output'.\n"
        "• If a categorical variable is one-hot encoded (e.g., columns named 'pam50 subtype__Basal', 'pam50 subtype__Her2', etc. instead of a single 'pam50 subtype'), reconstruct the original category column like this:\n"
        "    pam50_cols = ['pam50 subtype__Basal', 'pam50 subtype__Her2', 'pam50 subtype__LumA', 'pam50 subtype__LumB', 'pam50 subtype__Normal']\n"
        "    clinical_df['pam50 subtype'] = clinical_df[pam50_cols].idxmax(axis=1).str.replace('pam50 subtype__', '')\n"
        "    Then use 'pam50 subtype' for further analysis.\n\n"

        "Example for value counts:\n"
        "    status_counts = clinical_df['status'].value_counts().to_frame().reset_index()\n"
        "    status_counts.columns = ['status', 'count']\n"
        "    status_table = status_counts.to_markdown(index=False)\n"
        "    output = f\"## Value Counts for Status\\n{status_table}\\n\"\n\n"

        f"Data columns: {columns}\n"
        "Analysis steps:\n"
        + '\n'.join([f"- {step}" for step in steps])
        + "\n\n"
        "Return only valid executable Python code. Do not include markdown, explanations, or code fences—just code."
    )


    import openai, os
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=900,
        temperature=0.2,
    )
    code = response.choices[0].message.content.strip()
    # Optionally, strip markdown if present
    import re
    match = re.search(r"```python\n(.+?)\n```", code, re.DOTALL)
    if match:
        code = match.group(1)
    return code
