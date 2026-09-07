import sys
import os
from django.core.management.base import BaseCommand

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 'ml')
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from ml.pipeline import InsurancePredictionPipeline, MODEL_DIR, MODEL_FILES


class Command(BaseCommand):
    help = (
        'Train the ML models for insurance prediction. '
        'Skips training when saved models already exist (pass --force to retrain). '
        'Intended to run at service startup after the database is reachable.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force retraining even if saved models already exist.',
        )

    def handle(self, *args, **options):
        if not options['force']:
            missing = [f for f in MODEL_FILES if not os.path.exists(os.path.join(MODEL_DIR, f))]
            if not missing:
                self.stdout.write(self.style.WARNING(
                    'Models are already trained. Use --force to retrain the ML models.'
                ))
                return

        self.stdout.write('Training models...')
        pipeline = InsurancePredictionPipeline()
        metrics = pipeline.train()
        self.stdout.write(self.style.SUCCESS(
            f'Models trained successfully. Best model: {pipeline.best_model_name}'
        ))
        for name, m in metrics['models'].items():
            self.stdout.write(f'  {name}: Accuracy={m["accuracy"]}, F1={m["f1_score"]}')