import sys
import os
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from .models import PredictionHistory
from .serializers import (
    PredictionInputSerializer, PredictionHistorySerializer
)

# Ensure ml package is importable
ML_DIR = str(settings.BASE_DIR / 'ml')
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from ml.pipeline import InsurancePredictionPipeline

pipeline = InsurancePredictionPipeline()


class PredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PredictionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        age = serializer.validated_data['age']
        estimated_salary = serializer.validated_data['estimated_salary']

        result = pipeline.predict(age, estimated_salary)

        predictions = result['predictions']
        metrics = result['metrics']

        # Merge per-model metrics into predictions for frontend display
        enriched_predictions = {}
        for model_name, pred_info in predictions.items():
            model_metrics = metrics.get(model_name, {})
            enriched_predictions[model_name] = {
                'prediction': pred_info['prediction'],
                'label': pred_info['label'],
                'accuracy': model_metrics.get('accuracy', 0),
                'precision': model_metrics.get('precision', 0),
                'recall': model_metrics.get('recall', 0),
                'f1_score': model_metrics.get('f1_score', 0),
            }

        best_model_name = result['best_model']
        best_metrics = metrics.get(best_model_name, {})

        history = PredictionHistory.objects.create(
            user=request.user,
            age=age,
            estimated_salary=estimated_salary,
            logistic_regression_prediction=bool(predictions['Logistic Regression']['prediction']),
            knn_prediction=bool(predictions['K-Nearest Neighbors']['prediction']),
            svm_prediction=bool(predictions['Support Vector Machine']['prediction']),
            decision_tree_prediction=bool(predictions['Decision Tree']['prediction']),
            random_forest_prediction=bool(predictions['Random Forest']['prediction']),
            best_model_name=best_model_name,
            best_model_prediction=bool(result['best_prediction']['prediction']),
            model_metrics=metrics,
        )

        return Response({
            'id': history.id,
            'purchased': bool(result['best_prediction']['prediction']),
            'input': result['input'],
            'predictions': enriched_predictions,
            'best_model': best_model_name,
            'best_model_accuracy': best_metrics.get('accuracy', 0),
            'best_prediction': result['best_prediction'],
            'metrics': metrics,
        }, status=status.HTTP_201_CREATED)


class PredictionHistoryView(generics.ListAPIView):
    serializer_class = PredictionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)


class PredictionHistoryDeleteView(generics.DestroyAPIView):
    serializer_class = PredictionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)


class ModelPerformanceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            performance = pipeline.get_model_performance()
            return Response(performance)
        except Exception as e:
            return Response(
                {'error': 'Models not trained yet. Run train_models command.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class DatasetInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            info = pipeline.get_dataset_info()
            return Response(info)
        except Exception as e:
            return Response(
                {'error': 'Could not load dataset info.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
