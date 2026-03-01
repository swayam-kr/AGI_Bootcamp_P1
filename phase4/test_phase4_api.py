import pytest
from fastapi.testclient import TestClient
from api_service import app
import os
from unittest.mock import MagicMock

client = TestClient(app)

def test_api_metadata():
    response = client.get("/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "areas" in data
    assert "cuisines" in data
    assert len(data["areas"]) > 0

def test_recommend_ranking():
    # Test top_k and ranking
    payload = {
        "area": None,
        "min_cost": 0,
        "max_cost": 5000,
        "min_rating": 4.5,
        "top_k": 3
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["candidates"]) <= 3
    # Check if they are sorted by rating
    ratings = [c['rating_clean'] for c in data["candidates"]]
    assert ratings == sorted(ratings, reverse=True)

def test_restaurant_details_404():
    response = client.get("/restaurant/NonExistentRestaurant/details")
    assert response.status_code == 404
