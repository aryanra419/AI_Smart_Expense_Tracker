from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime

# Configure Flask to serve the React 'dist' folder
app = Flask(__name__, static_folder='../dist', static_url_path='/')

# Setup allowed origins for production
ALLOWED_ORIGINS = [
    "https://arcodes.online",
    "https://www.arcodes.online",
    "https://ai-smart-expense-tracker-drab.vercel.app",
    "http://localhost:5173"
]
CORS(app, origins=ALLOWED_ORIGINS)

# On Render free tier, SQLite is ephemeral. Using environment variables allows mapping a persistent volume if available.
DB_FILE = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'expenses.db'))

# Serve React Frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Expenses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT,
            amount REAL,
            category TEXT,
            date TEXT
        )
    """)
    
    # Create Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            budget REAL,
            category_budgets TEXT
        )
    """)
    
    # Initialize default settings if empty
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        default_categories = json.dumps({
            "Food": 5000, 
            "Transport": 3000, 
            "Shopping": 5000, 
            "Entertainment": 2500, 
            "Health": 2000
        })
        cursor.execute(
            "INSERT INTO settings (id, budget, category_budgets) VALUES (1, 5000, ?)",
            (default_categories,)
        )
    
    conn.commit()
    conn.close()

@app.route('/api/data', methods=['GET'])
def get_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get Expenses
    cursor.execute("SELECT * FROM expenses ORDER BY date DESC")
    expenses = [dict(row) for row in cursor.fetchall()]
    
    # Get Settings
    cursor.execute("SELECT budget, category_budgets FROM settings WHERE id = 1")
    settings = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        "expenses": expenses,
        "budget": settings['budget'],
        "categoryBudgets": json.loads(settings['category_budgets'])
    })

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    new_expense = request.json
    desc = new_expense.get('description', '')
    amount = new_expense.get('amount', 0)
    category = new_expense.get('category', 'Other')
    date_str = new_expense.get('date', datetime.now().isoformat())
    
    cursor.execute(
        "INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)",
        (desc, amount, category, date_str)
    )
    conn.commit()
    
    new_id = cursor.lastrowid
    conn.close()
    
    return jsonify({**new_expense, "id": new_id}), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    
    conn.close()
    return jsonify({"success": True}), 200

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = request.json
    
    if 'budget' in updates and 'categoryBudgets' in updates:
        cursor.execute(
            "UPDATE settings SET budget = ?, category_budgets = ? WHERE id = 1",
            (updates['budget'], json.dumps(updates['categoryBudgets']))
        )
    elif 'budget' in updates:
        cursor.execute("UPDATE settings SET budget = ? WHERE id = 1", (updates['budget'],))
    elif 'categoryBudgets' in updates:
        cursor.execute("UPDATE settings SET category_budgets = ? WHERE id = 1", (json.dumps(updates['categoryBudgets']),))
        
    conn.commit()
    conn.close()
    return jsonify({"success": True}), 200

if __name__ == '__main__':
    print("Initializing SQLite Database...")
    init_db()
    print("Starting Flask Server on port 5000...")
    app.run(port=5000, debug=True)
