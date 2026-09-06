from django.contrib import admin
from .models import PredictionHistory


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'age', 'estimated_salary', 'best_model_name', 'best_model_prediction', 'created_at']
    list_filter = ['best_model_name', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
