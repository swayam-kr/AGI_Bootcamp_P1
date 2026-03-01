import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file in the current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

class GroqService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            # We don't raise an error here to allow the app to start, 
            # but we will handle it when calling the recommendation.
            self.client = None
        else:
            self.client = Groq(api_key=api_key)

    def get_recommendation_rationale(self, restaurants, user_prefs):
        """
        Takes a list of candidate restaurants and user preferences, 
        and returns a natural language recommendation from Groq.
        """
        if not self.client:
            return "AI Recommendation system is not configured. Please add your GROQ_API_KEY in the .env file."

        # Prepare the prompt
        restaurant_details = ""
        for i, r in enumerate(restaurants):
            name = r.get('name', r.get('restaurant name', 'Unknown'))
            cuisine = r.get('cuisines', 'Unknown')
            rating = r.get('rating_clean', 'N/A')
            cost = r.get('cost_clean', 'N/A')
            restaurant_details += f"{i+1}. {name} - Cuisines: {cuisine}, Rating: {rating}, Avg Cost for two: {cost}\n"

        prompt = f"""
        You are an expert food critic and restaurant recommender.
        Based on the user's preferences: {user_prefs}, 
        here are some top restaurant candidates from the Zomato dataset:
        
        {restaurant_details}
        
        Please provide a concise, friendly recommendation for the best match. 
        Explain why it's a great choice based on the user's specific preferences.
        Keep the response professional but enthusiastic.
        """

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile", # Groq model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that recommends restaurants."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error generating recommendation: {str(e)}"
