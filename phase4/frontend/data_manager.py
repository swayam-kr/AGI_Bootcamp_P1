import pandas as pd
from datasets import load_dataset
import re
import os

class DataManager:
    def __init__(self, dataset_name="ManikaSaini/zomato-restaurant-recommendation"):
        self.dataset_name = dataset_name
        self.df = None

    def load_data(self):
        """Loads the pre-cleaned, deduplicated production dataset (12,499 restaurants)."""
        if self.df is not None:
            return True
        
        local_path = os.path.join(os.path.dirname(__file__), "restaurants_full_accurate.csv")
        try:
            if os.path.exists(local_path):
                self.df = pd.read_csv(local_path)
                # Since the bundled data is already filtered/cleaned by the production script, we're ready
                return True
        except Exception as e:
            print(f"Error loading bundled dataset: {e}")
        
        # Fallback if bundled file is missing
        return False

    def clean_data(self):
        """Data is pre-cleaned in the 'restaurants_full_accurate.csv' bundle."""
        return True

    def search_restaurants(self, area=None, min_cost=0, max_cost=10000, min_rating=0, cuisine=None, online_order=None, book_table=None, top_k=5):
        """Advanced filtering with ranking and new binary filters."""
        if self.df is None: return []

        results = self.df.copy()
        
        if area:
            results = results[results['area_clean'] == area]
        
        if cuisine:
            results = results[results['cuisines_clean'].str.contains(cuisine, case=False, na=False)]

        if online_order is not None:
            results = results[results['online_order_clean'] == (1 if online_order else 0)]
            
        if book_table is not None:
            results = results[results['book_table_clean'] == (1 if book_table else 0)]
        
        results = results[
            (results['cost_clean'] >= min_cost) & 
            (results['cost_clean'] <= max_cost) &
            (results['rating_clean'] >= min_rating)
        ]

        # Ranking logic: Sort by rating (primary) and cost (secondary)
        results = results.sort_values(by=['rating_clean', 'cost_clean'], ascending=[False, True])

        # Return relevant data
        output_cols = ['name_clean', 'rating_clean', 'cost_clean', 'area_clean', 'cuisines_clean', 'dish_liked_clean', 'reviews_clean', 'address', 'url']
        available_cols = [c for c in output_cols if c in self.df.columns]
        
        return results.head(top_k)[available_cols].to_dict('records')

    def get_restaurant_by_name(self, name):
        """Fetches a single restaurant for deep AI evaluation."""
        if self.df is None: return None
        match = self.df[self.df['name_clean'] == name].head(1)
        return match.to_dict('records')[0] if not match.empty else None
