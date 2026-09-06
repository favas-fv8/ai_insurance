from django.db import models
from django.contrib.auth.models import User


class PredictionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    age = models.FloatField()
    estimated_salary = models.FloatField()

    logistic_regression_prediction = models.BooleanField()
    knn_prediction = models.BooleanField()
    svm_prediction = models.BooleanField()
    decision_tree_prediction = models.BooleanField()
    random_forest_prediction = models.BooleanField()

    best_model_name = models.CharField(max_length=100)
    best_model_prediction = models.BooleanField()

    model_metrics = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Prediction Histories'

    def __str__(self):
        return f"Prediction for age={self.age}, salary={self.estimated_salary} by {self.user.username}"
