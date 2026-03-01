# Phase 2: AI Core & Backend Integration (Groq)

## Overview
This phase integrates the Groq LLM to provide natural language recommendations for the restaurant dataset.

## Setup Instructions

### 1. Configure the API Key
Copy the `.env.example` file to create a new `.env` file and add your Groq API key:
```bash
cp .env.example .env
```
Add your key inside `.env`:
`GROQ_API_KEY=your_key_here`

### 2. Startup
To run the backend server:
```bash
python3 start_backend.py
```
This will start a FastAPI server at `http://127.0.0.1:8000`.

## Key Files:
- `api_service.py`: FastAPI server with endpoints for getting recommendations.
- `groq_client.py`: Wrapper for Groq API integration (handles prompt and rationale generation).
- `data_manager.py`: (Carried from Phase 1) Handles Zomato dataset filtering.

## API Usage
- **POST** `/recommend`
  - **Body**:
    ```json
    {
      "area": "BTM",
      "max_cost": 1000,
      "min_rating": 4.5
    }
    ```
