import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv
import os
import ast

def generate_tasks(project_desc: str)-> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = f"""
    <prompt>
        <step1>Analyze the topic description: "{project_desc}".</step1>
        <step2>Break the topic into a series of logical tasks or steps needed to completely understand the topic.</step2>
        <step3>For each task, estimate the number of days it will take to complete.</step3>
        <step4>Return the tasks as a JSON array, where each task includes 'task', 'description', and 'daysToFinish'.</step4>
        <step5>Prepend each task name with its number in the format "1) ", "2) ", etc.</step5>
        <step6>Ensure the response is formatted as valid JSON without any additional text.</step6>
    </prompt>
    """

    response = model.generate_content(llm_prompt)
    start_idx = response.text.find("[")
    end_idx = response.text.rfind("]") + 1
    trimmed_response = response.text[start_idx:end_idx]

    return ast.literal_eval(trimmed_response)