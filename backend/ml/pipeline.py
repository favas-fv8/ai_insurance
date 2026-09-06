import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_models')
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')


class InsurancePredictionPipeline:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.metrics = {}
        self.best_model_name = None
        self.is_trained = False

    def load_data(self):
        data_path = os.path.join(DATA_DIR, 'Social_Network_Ads.csv')
        df = pd.read_csv(data_path)
        X = df[['Age', 'EstimatedSalary']]
        y = df['Purchased']
        return X, y, df

    def train(self):
        X, y, df = self.load_data()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=0
        )

        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        model_configs = {
            'Logistic Regression': LogisticRegression(random_state=0),
            'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
            'Support Vector Machine': SVC(kernel='rbf', random_state=0, probability=True),
            'Decision Tree': DecisionTreeClassifier(criterion='entropy', random_state=0),
            'Random Forest': RandomForestClassifier(n_estimators=100, criterion='entropy', random_state=0),
        }

        results = {}
        for name, model in model_configs.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            metrics = {
                'accuracy': round(accuracy_score(y_test, y_pred), 4),
                'precision': round(precision_score(y_test, y_pred), 4),
                'recall': round(recall_score(y_test, y_pred), 4),
                'f1_score': round(f1_score(y_test, y_pred), 4),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            }

            self.models[name] = model
            results[name] = metrics

        self.metrics = {
            'models': results,
            'test_size': len(y_test),
            'train_size': len(y_train),
            'total_samples': len(y),
            'feature_names': ['Age', 'EstimatedSalary'],
            'class_distribution': {
                'purchased': int(y.sum()),
                'not_purchased': int(len(y) - y.sum()),
            }
        }

        best_name = max(
            results.keys(),
            key=lambda k: (results[k]['accuracy'], results[k]['f1_score'])
        )
        self.best_model_name = best_name
        self.is_trained = True

        self.save()
        return self.metrics

    def predict(self, age, estimated_salary):
        if not self.is_trained:
            self.load()

        features = np.array([[age, estimated_salary]])
        features_scaled = self.scaler.transform(features)

        predictions = {}
        for name, model in self.models.items():
            pred = int(model.predict(features_scaled)[0])
            predictions[name] = {
                'prediction': pred,
                'label': 'Will Purchase' if pred == 1 else 'Will Not Purchase',
            }

        best_prediction = predictions[self.best_model_name]

        return {
            'input': {'age': age, 'estimated_salary': estimated_salary},
            'predictions': predictions,
            'best_model': self.best_model_name,
            'best_prediction': best_prediction,
            'metrics': self.metrics['models'],
        }

    def save(self):
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(self.models, os.path.join(MODEL_DIR, 'models.pkl'))
        joblib.dump(self.scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))
        joblib.dump(self.metrics, os.path.join(MODEL_DIR, 'metrics.pkl'))
        joblib.dump(self.best_model_name, os.path.join(MODEL_DIR, 'best_model.pkl'))

    def load(self):
        self.models = joblib.load(os.path.join(MODEL_DIR, 'models.pkl'))
        self.scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        self.metrics = joblib.load(os.path.join(MODEL_DIR, 'metrics.pkl'))
        self.best_model_name = joblib.load(os.path.join(MODEL_DIR, 'best_model.pkl'))
        self.is_trained = True

    def get_dataset_info(self):
        _, _, df = self.load_data()
        return {
            'total_records': len(df),
            'features': list(df.columns),
            'age_stats': {
                'mean': round(df['Age'].mean(), 2),
                'min': int(df['Age'].min()),
                'max': int(df['Age'].max()),
                'std': round(df['Age'].std(), 2),
            },
            'salary_stats': {
                'mean': round(df['EstimatedSalary'].mean(), 2),
                'min': int(df['EstimatedSalary'].min()),
                'max': int(df['EstimatedSalary'].max()),
                'std': round(df['EstimatedSalary'].std(), 2),
            },
            'purchase_rate': round(df['Purchased'].mean() * 100, 2),
            'class_distribution': {
                'purchased': int(df['Purchased'].sum()),
                'not_purchased': int(len(df) - df['Purchased'].sum()),
            }
        }

    def get_model_performance(self):
        if not self.is_trained:
            self.load()
        return {
            'models': self.metrics['models'],
            'best_model': self.best_model_name,
            'training_info': {
                'test_size': self.metrics['test_size'],
                'train_size': self.metrics['train_size'],
                'total_samples': self.metrics['total_samples'],
            }
        }
