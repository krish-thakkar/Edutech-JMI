from flask import Flask, request, jsonify
from typing import Dict, List, Optional
import google.generativeai as genai
import json
from dataclasses import dataclass, asdict
from groq import Groq
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@dataclass
class Task:
    name: str
    description: str
    difficulty: str
    points: int
    completed: bool = False
    verified: bool = False

@dataclass
class Theme:
    name: str
    description: str
    badges: List[str]
    icons: List[str]

@dataclass
class Roadmap:
    interest: str
    level: str
    theme: Theme
    tasks: List[Task]
    total_points: int = 0
    current_badge: str = ""

class LearningRoadmapSystem:
    def __init__(self):
        # API keys should be configured through environment variables or config file
        self.gemini_api_key = "AIzaSyA4oJilLLoN362wuqnz_XTGRN2bchrqTeE"  # Replace with actual API key
        self.groq_api_key = "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"  # Replace with actual API key

        try:
            # Initialize Gemini
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')

            # Initialize Groq (Llama)
            self.llm = Groq(api_key=self.groq_api_key)

        except Exception as e:
            print(f"⚠️ Error initializing APIs: {e}")
            raise

    def extract_json_from_response(self, text: str) -> dict:
        """Extract JSON from the response text"""
        try:
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
            return json.loads(text)
        except Exception as e:
            print(f"Error parsing response: {e}")
            return None

    def generate_theme_with_llama(self, interest: str) -> dict:
        """Generate theme using Llama model"""
        prompt = f"""
        Create a learning theme for {interest} with the following JSON structure:
        {{
            "name": "theme name",
            "description": "theme description",
            "badges": ["badge1", "badge2", "badge3"],
            "icons": ["emoji1", "emoji2", "emoji3"]
        }}
        The theme should be creative and relate to {interest}.
        Use appropriate emoji icons that match the theme.
        Return only valid JSON.
        """

        try:
            response = self.llm.chat.completions.create(
                model="llama-3.2-1b-preview",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=500
            )
            return self.extract_json_from_response(response.choices[0].message.content)
        except Exception as e:
            print(f"Llama API error: {e}")
            return None

    def generate_theme(self, interest: str) -> Theme:
        """Generate a themed learning experience"""
        prompt = f"""
        Create a creative and engaging learning theme for {interest}.
        Return a JSON object with exactly this structure:
        {{
            "name": "theme name that relates to {interest}",
            "description": "engaging description of the learning journey",
            "badges": ["beginner level badge", "intermediate level badge", "expert level badge"],
            "icons": ["emoji1", "emoji2", "emoji3"]
        }}
        Use emojis that match the theme of {interest}.
        Return only the JSON object, no additional text.
        """

        try:
            response = self.gemini_model.generate_content(prompt)
            theme_data = self.extract_json_from_response(response.text)

            if not theme_data:
                theme_data = self.generate_theme_with_llama(interest)

            if not theme_data:
                raise Exception("Theme generation failed with both models")

            return Theme(
                name=theme_data["name"],
                description=theme_data["description"],
                badges=theme_data["badges"],
                icons=theme_data["icons"]
            )
        except Exception as e:
            return Theme(
                name=f"{interest.title()} Explorer",
                description=f"Embark on an exciting journey to master {interest}",
                badges=["Knowledge Seeker", "Skilled Practitioner", "Grand Master"],
                icons=["🌟", "⚡", "👑"]
            )

    def generate_tasks(self, interest: str, level: str) -> List[Task]:
        """Generate tasks using available models"""
        prompt = f"""
        Create 5 specific learning tasks for {interest} at {level} level.
        Return a JSON object with this structure:
        {{
            "tasks": [
                {{
                    "name": "specific task name",
                    "description": "detailed description of what to do",
                    "difficulty": "easy/medium/hard"
                }}
            ]
        }}
        Tasks should be practical and progressively challenging.
        Return only the JSON object, no additional text.
        """

        try:
            response = self.gemini_model.generate_content(prompt)
            tasks_data = self.extract_json_from_response(response.text)

            if not tasks_data:
                tasks_data = self.generate_tasks_with_llama(interest, level)

            if not tasks_data:
                raise Exception("Task generation failed with both models")

            tasks = []
            for task_info in tasks_data["tasks"]:
                points = {"easy": 1, "medium": 2, "hard": 3}[task_info["difficulty"].lower()]
                tasks.append(Task(
                    name=task_info["name"],
                    description=task_info["description"],
                    difficulty=task_info["difficulty"].lower(),
                    points=points
                ))
            return tasks

        except Exception as e:
            return [
                Task(name=f"Explore {interest} basics",
                     description=f"Learn and document fundamental concepts of {interest}",
                     difficulty="easy", points=1),
                Task(name=f"Hands-on {interest} practice",
                     description=f"Complete practical exercises in {interest}",
                     difficulty="easy", points=1),
                Task(name=f"{interest} implementation project",
                     description=f"Build a small project using {interest} concepts",
                     difficulty="medium", points=2),
                Task(name=f"Advanced {interest} challenge",
                     description=f"Solve complex problems in {interest}",
                     difficulty="hard", points=3),
                Task(name=f"Master {interest} project",
                     description=f"Create a comprehensive project showcasing mastery of {interest}",
                     difficulty="hard", points=3)
            ]

    def create_roadmap(self, interest: str, level: str) -> Roadmap:
        """Create a complete roadmap with theme and tasks"""
        theme = self.generate_theme(interest)
        tasks = self.generate_tasks(interest, level)
        return Roadmap(interest=interest, level=level, theme=theme, tasks=tasks)

# Initialize the system
roadmap_system = LearningRoadmapSystem()

@app.route('/api/roadmap', methods=['POST'])
def create_learning_roadmap():
    try:
        data = request.get_json()
        interest = data.get('interest')
        level = data.get('level')

        if not interest or not level:
            return jsonify({
                'error': 'Missing required fields: interest and level are required'
            }), 400

        if level.lower() not in ['beginner', 'intermediate', 'advanced']:
            return jsonify({
                'error': 'Invalid level. Must be one of: beginner, intermediate, advanced'
            }), 400

        roadmap = roadmap_system.create_roadmap(interest, level)
        
        # Convert dataclass to dictionary for JSON serialization
        roadmap_dict = asdict(roadmap)
        
        return jsonify({
            'success': True,
            'data': roadmap_dict
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Learning Roadmap API is running'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5100)