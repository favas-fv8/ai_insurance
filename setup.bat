@echo off
echo ============================================
echo   Ai-IPP - Project Setup
echo ============================================
echo.

REM 1. Python venv
echo [1/5] Creating Python virtual environment...
cd backend
python -m venv .venv
call .venv\Scripts\activate.bat

REM 2. Install Python dependencies
echo [2/5] Installing Python dependencies...
pip install -r requirements.txt --quiet

REM 3. Database migration
echo [3/5] Running database migrations...
python manage.py migrate --run-syncdb 2>nul
python manage.py migrate

REM 4. Train ML models
echo [4/5] Training ML models...
python manage.py train_models

REM 5. Frontend dependencies
echo [5/5] Installing frontend dependencies...
cd ..\frontend
call npm install

cd ..
echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start the project, run: start-app.bat
echo.
pause
