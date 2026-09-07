#!/usr/bin/env bash
# Build script for Render. Runs from the `backend` root directory.
# Free-tier compatible (no preDeployCommand): everything runs in this build.
set -e

echo "--> Upgrading pip..."
python -m pip install --upgrade pip

echo "--> Installing Python dependencies..."
pip install -r requirements.txt

echo "--> Applying database migrations..."
python manage.py migrate --noinput

echo "--> Training ML models..."
python manage.py train_models

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Build complete."