import pandas as pd
from datasets import load_dataset
import re
import os

class DataManager:
    def __init__(self, dataset_name="ManikaSaini/zomato-restaurant-recommendation"):
        self.dataset_name = dataset_name
        self.df = None

    def load_data(self):
        """Loads data from Hugging Face and converts to pandas DataFrame."""
        try:
            # We use cache_dir to ensure it stays in our project folder if possible, 
            # though HF usually handles this.
            dataset = load_dataset(self.dataset_name, trust_remote_code=True)
            # Accessing the first split (usually 'train')
            split_name = list(dataset.keys())[0]
            self.df = pd.DataFrame(dataset[split_name])
            return True
        except Exception as e:
            print(f"Error loading dataset: {e}")
            return False

    def clean_data(self):
        """Cleans columns: ratings, avg cost, and handles NaNs."""
        if self.df is None:
            return False

        # Attempt to find columns by name variations
        def find_col(target_names):
            for name in target_names:
                if name in self.df.columns:
                    return name
            return None

        # 1. Standardize Ratings
        rating_col = find_col(['rate', 'rate (out of 5)'])
        def parse_rating(val):
            if pd.isna(val) or str(val).strip() in ["NEW", "-", "nan", ""]:
                return 0.0
            try:
                # Extract numeric part e.g. "4.1" from "4.1/5"
                match = re.search(r"(\d+\.\d+)", str(val))
                if match:
                    return float(match.group(1))
                match_int = re.search(r"(\d+)", str(val))
                if match_int:
                    return float(match_int.group(1))
                return 0.0
            except:
                return 0.0

        if rating_col:
            self.df['rating_clean'] = self.df[rating_col].apply(parse_rating)
        else:
            self.df['rating_clean'] = 0.0

        # 2. Standardize Cost
        cost_col = find_col(['approx_cost(for two people)', 'avg cost (two people)', 'avg_cost_two_people'])
        def parse_cost(val):
            if pd.isna(val) or str(val).strip() == "":
                return 0
            try:
                cleaned = str(val).replace(",", "")
                return int(float(cleaned))
            except:
                return 0

        if cost_col:
            self.df['cost_clean'] = self.df[cost_col].apply(parse_cost)
        else:
            self.df['cost_clean'] = 0
        
        # 3. Standardize Location/Area
        area_col = find_col(['listed_in(city)', 'area', 'location'])
        if area_col:
            self.df['area_clean'] = self.df[area_col].fillna('Unknown')
        else:
            self.df['area_clean'] = 'Unknown'

        # 4. Handle Generic NaNs
        self.df.fillna({
            'area_clean': 'Unknown',
            'cuisines': 'Unknown',
            'name': 'Unknown'
        }, inplace=True)
        
        return True

    def search_restaurants(self, area=None, max_cost=None, min_rating=None):
        """Basic filtering logic for Phase 1."""
        if self.df is None:
            return []

        results = self.df.copy()
        
        if area:
            results = results[results['area_clean'].str.contains(area, case=False, na=False)]
        
        if max_cost is not None:
            results = results[results['cost_clean'] <= max_cost]
            
        if min_rating is not None:
            results = results[results['rating_clean'] >= min_rating]

        # Return top 5 results for simplicity in Phase 1
        return results.head(5).to_dict('records')

if __name__ == "__main__":
    dm = DataManager()
    if dm.load_data():
        print("Data loaded successfully.")
        if dm.clean_data():
            print("Data cleaned successfully.")
            sample = dm.search_restaurants(max_cost=1000, min_rating=4.0)
            print(f"Found {len(sample)} restaurants matching criteria.")
            for r in sample:
                name = r.get('name', r.get('restaurant name', 'Unknown'))
                print(f"- {name} (Rating: {r['rating_clean']}, Cost: {r['cost_clean']})")
