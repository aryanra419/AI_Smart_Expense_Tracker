import os
import subprocess
import sys

def run_command(command, cwd=None, shell=True):
    print(f"Running: {command} in {cwd or 'current directory'}")
    result = subprocess.run(command, cwd=cwd, shell=shell)
    if result.returncode != 0:
        print(f"Command failed with code {result.returncode}")
        return False
    return True

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(backend_dir, '..'))
    frontend_dir = os.path.join(root_dir, 'frontend')
    
    # Check if node_modules exists in frontend, if not, install
    if not os.path.exists(os.path.join(frontend_dir, 'node_modules')):
        print("Installing frontend dependencies...")
        if not run_command('npm install', cwd=frontend_dir):
            sys.exit(1)

    # Build the frontend
    print("Building frontend...")
    if not run_command('npm run build', cwd=frontend_dir):
        print("Frontend build failed. Ensure you have Node.js installed.")
        # We continue anyway if dist already exists in frontend
        if not os.path.exists(os.path.join(frontend_dir, 'dist')):
            sys.exit(1)

    # Start the Flask server
    print("Starting Flask server...")
    # For production, it's better to use gunicorn on Linux/Unix
    # But for a cross-platform helper, we suggest running app.py
    os.environ['FLASK_ENV'] = 'production'
    # app.py is now in the same directory as this script (backend/)
    subprocess.run([sys.executable, os.path.join(backend_dir, 'app.py')])

if __name__ == '__main__':
    main()
