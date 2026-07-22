import os

def load_prompt(filename: str = "prompt for the AI.md") -> str:
    """
    Loads the system prompt from the specified file.
    """
    # Navigate up from backend/ai/prompt_loader.py to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    prompt_path = os.path.join(base_dir, filename)
    
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "You are an elite financial analyst. Please analyze the provided context."
