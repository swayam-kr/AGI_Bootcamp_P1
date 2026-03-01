import pytest
import pandas as pd
from data_manager import DataManager

@pytest.fixture
def sample_data():
    """Returns a dummy dataframe to test cleaning and search without network."""
    data = {
        'restaurant name': ['Rest1', 'Rest2', 'Rest3', 'Rest4'],
        'rate (out of 5)': ['4.1/5', 'NEW', '3.5/5', '4.5/5'],
        'avg cost (two people)': ['800', '1,200', '500', '2,000'],
        'area': ['BTM', 'Indiranagar', 'BTM', 'Koramangala'],
        'cuisines type': ['Pasta', 'Cafe', 'Pizza', 'Italian']
    }
    return pd.DataFrame(data)

def test_data_manager_initialization():
    dm = DataManager()
    assert dm.dataset_name == "ManikaSaini/zomato-restaurant-recommendation"
    assert dm.df is None

def test_data_cleaning(sample_data):
    dm = DataManager()
    dm.df = sample_data
    assert dm.clean_data() is True
    
    # Check rating_clean
    assert dm.df['rating_clean'].iloc[0] == 4.1
    assert dm.df['rating_clean'].iloc[1] == 0.0
    assert dm.df['rating_clean'].iloc[2] == 3.5
    
    # Check cost_clean
    assert dm.df['cost_clean'].iloc[0] == 800
    assert dm.df['cost_clean'].iloc[1] == 1200
    assert dm.df['cost_clean'].iloc[2] == 500

def test_search_restaurants(sample_data):
    dm = DataManager()
    dm.df = sample_data
    dm.clean_data()
    
    # Filter by area
    results = dm.search_restaurants(area="BTM")
    assert len(results) == 2
    
    # Filter by max cost
    results = dm.search_restaurants(max_cost=1000)
    assert len(results) == 2
    
    # Filter by min rating
    results = dm.search_restaurants(min_rating=4.0)
    assert len(results) == 2
    
    # Combined filter
    results = dm.search_restaurants(area="BTM", max_cost=1000, min_rating=4.0)
    assert len(results) == 1
    assert results[0]['restaurant name'] == 'Rest1'

def test_empty_search():
    dm = DataManager()
    # No data loaded
    results = dm.search_restaurants(max_cost=1000)
    assert len(results) == 0

# Note: Integration test with actual dataset is skipped here to save time and bandwidth.
# To run it manually, use `dm.load_data()` in a separate script.
