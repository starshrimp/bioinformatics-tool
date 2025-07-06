import openai
import os
import re
import json
import logging

logging.basicConfig(level=logging.INFO)  # Or use DEBUG for more verbosity
logger = logging.getLogger(__name__)

def extract_json(text):
    # Remove code fences and extra explanations
    text = text.strip()
    # Remove markdown code block if present
    if text.startswith("```json") or text.startswith("```"):
        text = re.sub(r"^```[a-z]*\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
    # Find the first {...} block (the main JSON object)
    match = re.search(r'(\{[\s\S]*\})', text)
    if match:
        text = match.group(1)
    return text


def call_planner_llm(user_query, columns):
    """
    Calls the Planner LLM: 
    Turns the user question into a plan for analysis steps.
    """
    prompt = (
        f"You are a bioinformatics analyst. Given the user question and data columns, "
        f"write a short step-by-step analysis plan for what code should do as a JSON object."
        f"Only include 3-4 analysis steps, no more."
        f"Respond only with a JSON object with a single key 'steps', which is a list of strings. Each string should describe a single analysis step. Do not use objects in the list. Output only valid JSON, nothing else."
        f"Be specific and concise.\n\n"
        f"\n\nData columns: {columns}\n"
        f"User question: {user_query}\n"
        f"Plan (as JSON):"
    )
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.2,
    )
    plan_str = response.choices[0].message.content.strip()

    logger.info('----RAW LLM PLANNER OUTPUT----\n%s\n------------------------------', plan_str)

    try:
        json_text = extract_json(plan_str)
        plan = json.loads(json_text)
        if plan and isinstance(plan, dict) and 'steps' in plan:
            steps = plan['steps']
            # Fix if LLM used {"step": "..."} objects
            if steps and isinstance(steps[0], dict) and 'step' in steps[0]:
                steps = [s['step'] for s in steps]
        else:
            steps = plan

    except Exception as e:
        print("JSON parsing failed:", e)
        raise
    return plan