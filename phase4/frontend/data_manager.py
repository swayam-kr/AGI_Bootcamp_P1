import pandas as pd
from datasets import load_dataset
import re
import os

class DataManager:
    def __init__(self, dataset_name="ManikaSaini/zomato-restaurant-recommendation"):
        self.dataset_name = dataset_name
        self.df = None

    def load_data(self):
        """Loads data with caching logic for serverless environments. Prefer local CSV."""
        if self.df is not None:
            return True
        
        # 1. Try Local CSV first (Best for Vercel/Production stability)
        local_path = os.path.join(os.path.dirname(__file__), "restaurants_subset.csv")
        if os.path.exists(local_path):
            try:
                self.df = pd.read_csv(local_path)
                return True
            except Exception as e:
                print(f"Error loading local CSV: {e}")

        # 2. Fallback to Hugging Face (Try small slice to avoid timeout)
        try:
            dataset = load_dataset(self.dataset_name, split='train[:1000]', trust_remote_code=False)
            self.df = pd.DataFrame(dataset)
            return True
        except Exception as e:
            print(f"Error loading from HF: {e}")
            return False

    def clean_data(self):
        """Standardizes columns for search and AI reasoning."""
        if self.df is None:
            return False

        def find_col(target_names):
            for name in target_names:
                if name in self.df.columns:
                    return name
            return None

        # 1. Rating
        rating_col = find_col(['rate', 'rate (out of 5)'])
        def parse_rating(val):
            if pd.isna(val) or str(val).strip() in ["NEW", "-", "nan", ""]: return 0.0
            try:
                match = re.search(r"(\d+\.\d+)", str(val))
                if match: return float(match.group(1))
                match_int = re.search(r"(\d+)", str(val))
                if match_int: return float(match_int.group(1))
                return 0.0
            except: return 0.0

        self.df['rating_clean'] = self.df[rating_col].apply(parse_rating) if rating_col else 0.0

        # 2. Cost
        cost_col = find_col(['approx_cost(for two people)', 'avg cost (two people)', 'avg_cost_two_people'])
        def parse_cost(val):
            if pd.isna(val) or str(val).strip() == "": return 0
            try:
                cleaned = str(val).replace(",", "")
                return int(float(cleaned))
            except: return 0

        self.df['cost_clean'] = self.df[cost_col].apply(parse_cost) if cost_col else 0

        # 3. Text Fields
        self.df['area_clean'] = self.df[find_col(['listed_in(city)', 'area', 'location']) or 'location'].fillna('Unknown')
        self.df['name_clean'] = self.df[find_col(['name', 'restaurant name']) or 'name'].fillna('Unknown')
        self.df['cuisines_clean'] = self.df[find_col(['cuisines', 'cuisines type']) or 'cuisines'].fillna('Unknown')
        self.df['dish_liked_clean'] = self.df['dish_liked'].fillna('Not specified') if 'dish_liked' in self.df.columns else 'Not specified'
        self.df['reviews_clean'] = self.df['reviews_list'].fillna('') if 'reviews_list' in self.df.columns else ''

        # 3b. New Filters (Online Order & Table Booking)
        online_col = find_col(['online_order'])
        self.df['online_order_clean'] = self.df[online_col].fillna('No').apply(lambda x: 1 if str(x).lower() == 'yes' else 0) if online_col else 0
        
        book_col = find_col(['book_table'])
        self.df['book_table_clean'] = self.df[book_col].fillna('No').apply(lambda x: 1 if str(x).lower() == 'yes' else 0) if book_col else 0

        # Address and URL are important for deduplication and display
        addr_col = find_col(['address', 'restaurant_address'])
        self.df['address'] = self.df[addr_col].fillna('No address listed') if addr_col else 'No address listed'
        
        url_col = find_col(['url', 'url_link'])
        self.df['url'] = self.df[url_col].fillna('') if url_col else ''

        # 4. Handle Duplicates (Very common in Zomato data)
        # We drop based on name and address to ensure we don't have multiple entries for the same shop
        self.df = self.df.drop_duplicates(subset=['name_clean', 'address'], keep='first')

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
