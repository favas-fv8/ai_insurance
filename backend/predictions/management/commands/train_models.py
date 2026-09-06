import sys
import os
from django.core.management.base import BaseCommand

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 'ml')
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from ml.pipeline import InsurancePredictionPipeline


class Command(BaseCommand):
    help = 'Train all ML models for insurance prediction'

    def handle(self, *args, **options):
        self.stdout.write('Training models...')
        pipeline = InsurancePredictionPipeline()
        metrics = pipeline.train()
        self.stdout.write(self.style.SUCCESS(
            f'Models trained successfully. Best model: {pipeline.best_model_name}'
        ))
        for name, m in metrics['models'].items():
            self.stdout.write(f'  {name}: Accuracy={m["accuracy"]}, F1={m["f1_score"]}')
