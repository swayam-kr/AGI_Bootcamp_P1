import pytest
from fastapi.testclient import TestClient
from api_service import app
import os

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the AI Restaurant Recommendation API"}

def test_recommendation_endpoint():
    # This test will attempt to call Groq if the API key is present.
    # If not, it might return the 'system not configured' message.
    payload = {
        "area": "BTM",
        "max_cost": 1000,
        "min_rating": 4.0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "candidates" in data
    assert "ai_rationale" in data
    
    # If API key is present, ai_rationale should be a string (the LLM output)
    assert isinstance(data["ai_rationale"], str)
    if os.getenv("GROQ_API_KEY"):
        # Basic check to see if it's not the error message
        assert "not configured" not in data["ai_rationale"].lower()
        assert len(data["ai_rationale"]) > 20 # Rationale should be substantial

def test_no_matches_found():
    # Search for something that won't exist (e.g. extremely high rating)
    payload = {
        "area": "BTM",
        "max_cost": 1,
        "min_rating": 5.0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["candidates"] == []
    assert "no restaurants match" in data["ai_rationale"].lower()
