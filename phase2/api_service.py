from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from data_manager import DataManager
from groq_client import GroqService

app = FastAPI(title="AI Restaurant Recommendation API")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize shared services
dm = DataManager()
dm.load_data()
dm.clean_data()
groq_service = GroqService()

@app.get("/metadata")
def get_metadata():
    """Returns unique areas and cuisines for the frontend dropdowns."""
    areas = sorted(dm.df['area_clean'].unique().tolist())
    # Flatten cuisines list
    all_cuisines = set()
    for c_str in dm.df['cuisines'].dropna():
        for c in str(c_str).split(','):
            all_cuisines.add(c.strip())
    
    return {
        "areas": areas,
        "cuisines": sorted(list(all_cuisines))
    }

class UserPreferences(BaseModel):
    area: Optional[str] = None
    max_cost: Optional[int] = None
    min_rating: Optional[float] = None
    cuisine: Optional[str] = None

class RecommendationResponse(BaseModel):
    candidates: List[dict]
    ai_rationale: str

@app.get("/")
def home():
    return {"message": "Welcome to the AI Restaurant Recommendation API"}

@app.post("/recommend", response_model=RecommendationResponse)
def get_recommendation(prefs: UserPreferences):
    """
    Endpoint that filters restaurants from data and 
    uses Groq to recommend the best match.
    """
    # 1. Filter candidates from data_manager
    candidates = dm.search_restaurants(
        area=prefs.area, 
        max_cost=prefs.max_cost, 
        min_rating=prefs.min_rating,
        cuisine=prefs.cuisine
    )

    if not candidates:
        return RecommendationResponse(
            candidates=[],
            ai_rationale="No restaurants match your filters. Try widening your criteria!"
        )

    # 2. Extract specific user context for the prompt
    user_context = f"Price < {prefs.max_cost or 'Any'}, Rating > {prefs.min_rating or 'Any'}, " \
                   f"Area: {prefs.area or 'Any'}, Cuisine Preference: {prefs.cuisine or 'Any'}"

    # 3. Call Groq for reasoning
    ai_rationale = groq_service.get_recommendation_rationale(candidates, user_context)

    return RecommendationResponse(
        candidates=candidates,
        ai_rationale=ai_rationale
    )

if __name__ == "__main__":
    import uvicorn
    # In production, this would be set as GROQ_API_KEY environment variable.
    uvicorn.run(app, host="0.0.0.0", port=8000)
