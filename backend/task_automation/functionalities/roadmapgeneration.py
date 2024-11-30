import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv
import os
import ast

def generate_roadmap(project_title: str)-> str:
    load_dotenv(find_dotenv())
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = f"""
    <prompt>
        <step1>Analyze the topic title: "{project_title}".</step1>
        <step2>Break the topic into a series of logical steps or milestones needed to undertsand the topic effectively.</step2>
        <step3>For each step, provide a concise description and estimate the number of days it will take to complete.</step3>
        <step4>Return the roadmap as a JSON object containing 'title' (string) and 'steps' (an array of objects).</step4>
        <step5>Each object in 'steps' should include 'stepNumber', 'name', 'description', and 'daysToFinish'.</step5>
        <step6>Ensure the response is formatted as valid JSON without any additional text.</step6>
    </prompt>
    """


    response = model.generate_content(llm_prompt)
    start_idx = response.text.find("[")
    end_idx = response.text.rfind("]") + 1
    trimmed_response = response.text[start_idx:end_idx]

    return ast.literal_eval(trimmed_response)