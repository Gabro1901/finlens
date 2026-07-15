import os

def load_prompt() -> str:
    """
    Loads the system prompt from 'prompt for the AI.md'.
    """
    # Navigate up from backend/ai/prompt_loader.py to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    prompt_path = os.path.join(base_dir, "prompt for the AI.md")
    
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "You are an elite financial analyst. Please analyze the provided context."
