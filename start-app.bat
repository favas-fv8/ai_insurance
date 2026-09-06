@echo off
echo ============================================
echo   Ai-IPP - Starting Application
echo ============================================
echo.

REM Start backend in a new window
echo Starting Django backend on http://localhost:8000 ...
start "Ai-IPP Backend" cmd /k "cd backend && call .venv\Scripts\activate.bat && python manage.py runserver"

REM Wait for backend to be ready
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting React frontend on http://localhost:3000 ...
start "Ai-IPP Frontend" cmd /k "cd frontend && npm start"

echo.
echo ============================================
echo   Both servers are starting!
echo ============================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:8000/admin/
echo ============================================
echo.
pause
