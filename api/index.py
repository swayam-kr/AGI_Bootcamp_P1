import sys
import os

# Add the directory containing api_service.py to the search path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'phase4')))

# Import the FastAPI instance
from api_service import app
