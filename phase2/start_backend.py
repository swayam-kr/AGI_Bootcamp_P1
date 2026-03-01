import uvicorn
import os

if __name__ == "__main__":
    print("Starting AI Restaurant Recommendation Service (Phase 2)...")
    uvicorn.run("api_service:app", host="127.0.0.1", port=8000, reload=True)
