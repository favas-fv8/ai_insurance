import os
import sys
from pathlib import Path

# Make the project (backend) directory importable when run under ASGI servers.
BASE_DIR = str(Path(__file__).resolve().parent.parent)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_insurance.settings')

from django.core.asgi import get_asgi_application  # noqa: E402

application = get_asgi_application()