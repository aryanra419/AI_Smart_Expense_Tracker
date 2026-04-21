# Smart Expense Tracker

A premium, full-stack financial management application with real-time spending intelligence, budget analytics, and behavioral insights.

## Project Structure

- `frontend/`: React + Vite application.
- `backend/`: Flask + SQLite backend.

## Development Setup

### 1. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend (Flask + SQLite)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Production Deployment (Unified Monolith)

This application is configured as a "Unified Monolith" for easy deployment. The Flask server serves both the API and the built React frontend.

### To Run in Production:
1. Ensure you have Node.js and Python installed.
2. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Start the application:
   ```bash
   # From the root directory:
   python backend/app.py
   
   # OR use the helper script in backend:
   # python backend/start_prod.py
   
   # OR on Linux/Unix with gunicorn:
   # cd backend
   # gunicorn app:app --bind 0.0.0.0:5000
   ```
5. Access your app at `http://your-server-ip:5000`.

### Custom Domain Setup:
Point your domain's A/CNAME records to your server and ensure port 5000 (or your chosen port) is open. We recommend using a reverse proxy like Nginx to handle SSL (HTTPS) and map your domain to port 5000.
