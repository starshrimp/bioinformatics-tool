import openai
import os
import json

def call_coder_llm(steps, columns):
    """
    Given a list of analysis steps and available data columns,
    generate Python code to execute all the steps on a DataFrame called 'clinical_df'.
    Return only the code (no explanations, no markdown).
    """
    # prompt = (
    #     "You are a Python data analyst. Given the following data analysis steps and available columns, "
    #     "generate Python code to accomplish all steps. The DataFrame is called 'clinical_df'.\n\n"
    #     "IMPORTANT: When selecting multiple columns (especially after groupby or in general), "
    #     "ALWAYS use a list of columns (square brackets) like clinical_df[['col1', 'col2']], "
    #     "and NEVER use a tuple (parentheses) like clinical_df['col1', 'col2'].\n"
    #     "Example:\n"
    #     "# Correct:\n"
    #     "grouped = clinical_df.groupby('treatment')[['survival_days', 'event']].mean()\n"
    #     "# Incorrect (will cause an error!):\n"
    #     "# grouped = clinical_df.groupby('treatment')['survival_days', 'event'].mean()\n\n"
    #     "Assume clinical_df is already loaded; do NOT include code for loading the data.\n"
    #     "Return ONLY executable Python code, nothing else (no markdown, no explanations).\n\n"
    #     f"Data columns: {columns}\n"
    #     f"Analysis steps:\n"
    #     + '\n'.join([f"- {step}" for step in steps])
    #     + "\n\nPython code:"
    # )
    prompt = (
        "You are a Python data analyst. Given the following data analysis steps and available columns, "
        "generate Python code to accomplish all steps. The DataFrame is called 'clinical_df'.\n\n"

        "IMPORTANT:\n"
        "• For every analysis, assign the main result (tables, statistics, key numbers) to a variable called 'output', formatted as a readable multi-line string. "
        "• Use markdown tables (e.g., .to_markdown() or .to_string(index=False)) for tables, f-strings for numbers, and add headings and line breaks.\n"
        "• When selecting multiple columns (especially after groupby or in general), ALWAYS use a list of columns (square brackets) like clinical_df[['col1', 'col2']]. "
        "• Do not use packages that are not already imported or installed. Only use pandas, numpy, scipy, matplotlib, lifelines and seaborn."
        "• For summary statistics, select only a small number of clinically relevant columns, not all columns. Always show summary statistics as a transposed table (variables as rows, stats as columns) using .describe().T.to_markdown().\n"
        "• For each categorical column, display value counts as a markdown table (use .value_counts().to_frame().to_markdown()).\n"
        "• Example:\n"
        "    status_counts = clinical_df['status'].value_counts().to_frame().reset_index()\n"
        "    status_counts.columns = ['status', 'count']\n"
        "    status_table = status_counts.to_markdown(index=False)\n"
        "    output = f\"## Value Counts for Status\\n{status_table}\\n\"\n"
        "• If a step asks for a plot or visualization, always generate a matplotlib or seaborn plot as well.\n"
        "• Never use print(). Never just define variables—always assign the summary to 'output'.\n"
        "• If there are multiple steps, concatenate the summaries for all steps into 'output'.\n\n"

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
