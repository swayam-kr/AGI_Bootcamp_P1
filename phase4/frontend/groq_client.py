import os
from groq import Groq
from dotenv import load_dotenv
from functools import lru_cache

# Absolute path for the .env file to ensure it's found when running from root
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

class GroqService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=api_key) if api_key else None

    @lru_cache(maxsize=100) # Simple in-memory caching for repetitive queries
    def get_recommendation_rationale(self, recommendations_hash, user_prefs):
        """
        Takes a set of restaurant names and user preferences, 
        and returns a natural language recommendation from Groq.
        We take recommendations_hash to make it cacheable.
        """
        if not self.client:
            return "AI system not configured. Please add your GROQ_API_KEY."

        prompt = f"""
        Expert Food Critic & Restaurant Recommender.
        User Preferences: {user_prefs}
        Candidates: {recommendations_hash}

        Analyze the candidates and recommend the best 1-2 matches. 
        Explain *why* they fit the specific user preferences.
        Keep the response engaging, professional, and under 150 words.
        """

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that recommends restaurants with flair."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    def get_deep_insight(self, restaurant_name, cuisines, dishes, reviews, rating, cost):
        """
        Generates a detailed pros/cons overview for a single restaurant.
        """
        if not self.client:
            return "AI Insight not available."

        prompt = f"""
        Analyze the following restaurant for pros and cons based on available data:
        Restaurant: {restaurant_name}
        Cuisines: {cuisines}
        Must-try dishes: {dishes}
        Rating: {rating}/5.0
        Cost for two: ₹{cost}
        Summarized Reviews: {reviews[:1500]} # Trim to fit tokens

        Please provide a concise analysis in this format:
        **Verdict:** 1 sentence summary.
        **Pros:** 3-4 bullet points.
        **Cons:** 1-2 bullet points.
        """

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a specialized food data analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

# Singleton for simplified usage
groq_service = GroqService()
