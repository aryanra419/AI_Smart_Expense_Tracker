import os
import subprocess
import sys

def run_command(command, shell=True):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=shell)
    if result.returncode != 0:
        print(f"Command failed with code {result.returncode}")
        return False
    return True

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check if node_modules exists, if not, install
    if not os.path.exists(os.path.join(root_dir, 'node_modules')):
        print("Installing frontend dependencies...")
        if not run_command('npm install'):
            sys.exit(1)

    # Build the frontend
    print("Building frontend...")
    if not run_command('npm run build'):
        print("Frontend build failed. Ensure you have Node.js installed.")
        # We continue anyway if dist already exists
        if not os.path.exists(os.path.join(root_dir, 'dist')):
            sys.exit(1)

    # Start the Flask server
    print("Starting Flask server as monolith...")
    # For production, it's better to use gunicorn on Linux/Unix
    # But for a cross-platform helper, we suggest running app.py
    os.environ['FLASK_ENV'] = 'production'
    subprocess.run([sys.executable, 'server/app.py'])

if __name__ == '__main__':
    main()
