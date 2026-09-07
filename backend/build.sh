#!/usr/bin/env bash
# Build script for Render. Runs from the `backend` root directory during the
# build phase (free-tier compatible). The build environment cannot reliably
# reach the database, so migrations and ML training are intentionally NOT run
# here — they run in the startCommand instead (build.sh -> runtime).
set -e

echo "--> Upgrading pip..."
python -m pip install --upgrade pip

echo "--> Installing Python dependencies..."
pip install -r requirements.txt

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Build complete."