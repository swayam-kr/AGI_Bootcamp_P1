# Phase 4: Production-Ready AI Restaurant Recommender

Welcome to the finalized version of the AI Restaurant Recommender. This phase focuses on advanced optimizations, a premium two-tier search console, and deep-dive AI insights.

## 🚀 Final Features
- **Two-Tier Search Interface**: 
  - **Primary Row**: Location and Cuisine filtering for quick navigation.
  - **Refinement Row**: Visual Price Range sliders, Numeric Rating filters, and custom Result Count controls.
- **Advanced Ranking**: Results are automatically prioritized by a hybrid score of Rating (quality) and Cost (value).
- **AI Deep-Dive Modals**: Click any restaurant to trigger a secondary LLM chain that analyzes 50,000+ reviews to provide pros, cons, and a definitive verdict.
- **Smart Data Cleaning**: Robust regex-based parsing for messy Zomato data (ratings like `4.1/5` or `NEW`).
- **LRU Caching**: In-memory response caching for Groq LLM to minimize latency and API costs.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, Pandas, Hugging Face Datasets.
- **AI**: Groq (Llama 3.3 70B Versatile).

## 🏃 Getting Started

### 1. Backend Setup
```bash
# Navigate to phase4
cd phase4

# Install dependencies
python3 -m pip install -r requirements.txt # (Or manual installs listed below)

# Add your GROQ_API_KEY to .env
echo "GROQ_API_KEY=your_key_here" > .env

# Start the API
python3 api_service.py
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev -- -p 3001
```

## 🧪 Testing
We have implemented comprehensive unit and integration tests:
```bash
python3 -m pytest test_phase4_backend.py
python3 -m pytest test_phase4_api.py
```

## 💎 Design Notes
- **Intuitive Inputs**: Fixed `NaN` errors and state handling for a smoother typing experience.
- **Glassmorphism**: Premium UI with translucent blur effects and animated transitions.
- **Error Handling**: Graceful fallbacks for backend connectivity issues and "No Results" scenarios.
