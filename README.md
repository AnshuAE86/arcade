# Vaibe Arcade

This project is split into two main parts:

- **frontend/**: A React + Vite project.
- **backend/**: A Python FastAPI project.

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deployment

The frontend is configured for deployment on Vercel using the `vercel.json` in the root directory.
