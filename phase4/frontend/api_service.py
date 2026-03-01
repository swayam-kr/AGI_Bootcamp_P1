from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from data_manager import DataManager
from groq_client import groq_service

app = FastAPI(title="AI Restaurant Discovery API v2", root_path="/api")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize shared services
dm = DataManager()
dm.load_data()
dm.clean_data()

class UserPreferences(BaseModel):
    area: Optional[str] = None
    min_cost: Optional[int] = 0
    max_cost: Optional[int] = 10000
    min_rating: Optional[float] = 0.0
    cuisine: Optional[str] = None
    online_order: Optional[bool] = None
    book_table: Optional[bool] = None
    top_k: Optional[int] = 5

class RecommendationResponse(BaseModel):
    candidates: List[dict]
    ai_rationale: str

# Initialize shared services
dm = DataManager()

def ensure_data():
    if dm.df is None:
        dm.load_data()
        dm.clean_data()

@app.get("/")
def home():
    return {"message": "AI Restaurant Recommendation API v2 - Ready"}

@app.get("/metadata")
def get_metadata():
    """Returns unique areas and cuisines for the frontend dropdowns. Loads data on demand."""
    ensure_data()
    if dm.df is None:
        # Fallback if the first load fails or is slow
        return {"areas": ["Bangalore", "HSR", "Koramangala"], "cuisines": ["North Indian", "South Indian", "Chinese"]}
    
    areas = sorted(dm.df['area_clean'].unique().tolist())
    all_cuisines = set()
    for c_str in dm.df['cuisines_clean'].dropna():
        for c in str(c_str).split(','):
            all_cuisines.add(c.strip())
    
    return {
        "areas": [a for a in areas if a != "Unknown"],
        "cuisines": sorted(list(all_cuisines)) if all_cuisines else []
    }

@app.post("/recommend", response_model=RecommendationResponse)
def get_recommendation(prefs: UserPreferences):
    """
    Filters restaurants and uses Groq to rank and recommend.
    """
    ensure_data()
    candidates = dm.search_restaurants(
        area=prefs.area, 
        min_cost=prefs.min_cost,
        max_cost=prefs.max_cost, 
        min_rating=prefs.min_rating,
        cuisine=prefs.cuisine,
        online_order=prefs.online_order,
        book_table=prefs.book_table,
        top_k=prefs.top_k or 5
    )

    if not candidates:
        return RecommendationResponse(
            candidates=[],
            ai_rationale="No restaurants match these exact filters. Try widening your price range or rating!"
        )

    # Simplified summary for hashing/prompt
    candidate_names = ", ".join([c['name_clean'] for c in candidates])
    user_context = f"Range: ₹{prefs.min_cost}-{prefs.max_cost}, Rating: {prefs.min_rating}+, Area: {prefs.area}, Cuisine: {prefs.cuisine}, Online: {prefs.online_order}, Booking: {prefs.book_table}"

    ai_rationale = groq_service.get_recommendation_rationale(candidate_names, user_context)

    return RecommendationResponse(
        candidates=candidates,
        ai_rationale=ai_rationale
    )

@app.get("/restaurant/{name}/details")
def get_restaurant_details(name: str):
    """Fetches AI pros/cons and deep analysis for a single restaurant."""
    ensure_data()
    rest = dm.get_restaurant_by_name(name)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Extract data for AI analysis
    insight = groq_service.get_deep_insight(
        restaurant_name=rest['name_clean'],
        cuisines=rest['cuisines_clean'],
        dishes=rest['dish_liked_clean'],
        reviews=rest['reviews_clean'],
        rating=rest['rating_clean'],
        cost=rest['cost_clean']
    )
    
    return {
        "metadata": rest,
        "ai_insight": insight
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
