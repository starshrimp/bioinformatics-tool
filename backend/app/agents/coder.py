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
        "• Do not use packages that are not already imported or installed. Only use pandas, numpy, matplotlib, lifelines, and seaborn.\n"
        "• NEVER use plt.savefig() with a file path—never save plots to disk. Just generate the plot. The system will capture and display the current figure automatically.\n"
        "• For summary statistics, select only a small number of clinically relevant columns, not all columns. Always show summary statistics as a transposed table (variables as rows, stats as columns) using .describe().T.to_markdown().\n"
        "• For each categorical column, display value counts as a markdown table (use .value_counts().to_frame().to_markdown()).\n"
        "• If a step asks for a plot or visualization, always generate a matplotlib or seaborn plot as well, but do NOT save it to disk or assign a string like 'Box Plot Saved...'.\n"
        "• Never use print(). Never just define variables—always assign the summary to 'output'.\n"
        "• If there are multiple steps, concatenate the summaries for all steps into 'output'.\n"

        "Example for value counts:\n"
        "    status_counts = clinical_df['status'].value_counts().to_frame().reset_index()\n"
        "    status_counts.columns = ['status', 'count']\n"
        "    status_table = status_counts.to_markdown(index=False)\n"
        "    output = f\"## Value Counts for Status\\n{status_table}\\n\"\n\n"
        "• Never use variables you have not explicitly defined earlier in the code (e.g. do not use 'var', 'df', 'ax', etc. unless they are defined)."
        "• Never use 'var' as a variable name; always use meaningful names related to the data or analysis (e.g., 'group', 'row', 'grouped', 'summary_stats')."
        "• Always write code that is self-contained and will run as-is, with all necessary variables defined in the correct order."
        "• When showing a DataFrame or table in the output, always limit the output to a maximum of 10 rows, using `.head(10)` or similar. If the table is longer, indicate in the output that it has been truncated (e.g., “... (table truncated, showing first 10 rows)”)."
        "Example: \n"
        "    output = f\"## Kaplan-Meier Survival Curve (first 10 rows):\n{km_df.head(10).to_markdown(index=False)}\n... (table truncated, showing first 10 rows)\\n\"\n\n"

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
        max_tokens=1000,
        temperature=0.2,
    )
    code = response.choices[0].message.content.strip()
    # Optionally, strip markdown if present
    import re
    match = re.search(r"```python\n(.+?)\n```", code, re.DOTALL)
    if match:
        code = match.group(1)
    return code
