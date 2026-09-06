from rest_framework import serializers
from .models import PredictionHistory


class PredictionInputSerializer(serializers.Serializer):
    age = serializers.FloatField(min_value=18, max_value=100)
    estimated_salary = serializers.FloatField(min_value=0)

    def validate_estimated_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated salary must be positive.")
        return value


class PredictionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = [
            'id', 'age', 'estimated_salary',
            'logistic_regression_prediction', 'knn_prediction',
            'svm_prediction', 'decision_tree_prediction',
            'random_forest_prediction',
            'best_model_name', 'best_model_prediction',
            'model_metrics', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PredictionResultSerializer(serializers.Serializer):
    input = serializers.DictField()
    predictions = serializers.DictField()
    best_model = serializers.CharField()
    best_prediction = serializers.DictField()
    metrics = serializers.DictField()
