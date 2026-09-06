from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.PredictionView.as_view(), name='predict'),
    path('history/', views.PredictionHistoryView.as_view(), name='prediction-history'),
    path('history/<int:pk>/', views.PredictionHistoryDeleteView.as_view(), name='prediction-delete'),
    path('model-performance/', views.ModelPerformanceView.as_view(), name='model-performance'),
    path('dataset-info/', views.DatasetInfoView.as_view(), name='dataset-info'),
]
