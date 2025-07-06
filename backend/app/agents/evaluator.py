import openai
import os
import re
import json
import logging

logger = logging.getLogger(__name__)

def call_evaluator_llm(user_query, output, steps=None):
    prompt = (
        "You are a clinical data analysis assistant. Your job is to interpret and explain the results of the following data analysis for a human reader.\n\n"
        f"User question: {user_query}\n\n"
        f"Analysis steps:\n{steps if steps else ''}\n\n"
        f"Results:\n{output}\n\n"
        "Write a short, contextually themed summary and explanation that helps the user understand the results. "
        "Highlight important findings, trends, or patterns. Do NOT invent or assume results that are not present in the output above. "
        "Format your response in readable markdown with headings and bullet points if appropriate."
    )
    import openai, os
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1200,
        temperature=0.2,
    )
    evaluation = response.choices[0].message.content.strip()
    return evaluation

def call_plot_explanation_llm(user_query, output, steps=None):
    """
    Generate a brief description of the plot: what variables it displays, type of plot, axes, etc.
    """
    prompt = (
        "You are a scientific data assistant. Your job is to provide a brief, clear description of a data plot created as part of an analysis."
        "\n\n"
        f"User question: {user_query}\n\n"
        f"Analysis steps:\n{steps if steps else ''}\n\n"
        f"Results (the output string may include plot creation code or figure descriptions):\n{output}\n\n"
        "Describe ONLY the plot: what type of plot it is, which variables are visualized, what the axes represent, and any basic information about the data shown. "
        "Do NOT provide any biological or clinical interpretation, trends, or insights—just describe the content and structure of the plot as a figure caption. "
        "Format your answer as a 2-3 sentence plain-language caption."
    )
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.2,
    )
    plot_explanation = response.choices[0].message.content.strip()
    return plot_explanation
