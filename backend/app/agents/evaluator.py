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
        max_tokens=400,
        temperature=0.2,
    )
    explanation = response.choices[0].message.content.strip()
    return explanation
