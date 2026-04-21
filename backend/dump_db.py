import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), 'expenses.db')

def dump_data():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} does not exist.")
        return

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- Expenses ---")
    cursor.execute("SELECT * FROM expenses")
    expenses = [dict(row) for row in cursor.fetchall()]
    for exp in expenses:
        print(exp)
        
    print("\n--- Settings ---")
    cursor.execute("SELECT * FROM settings")
    settings = [dict(row) for row in cursor.fetchall()]
    for s in settings:
        print(s)
    
    conn.close()

if __name__ == '__main__':
    dump_data()
