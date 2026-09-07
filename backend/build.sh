#!/usr/bin/env bash
# Build script for Render. Runs from the `backend` root directory.
set -e

echo "--> Upgrading pip..."
python -m pip install --upgrade pip

echo "--> Installing Python dependencies..."
pip install -r requirements.txt

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Build complete."