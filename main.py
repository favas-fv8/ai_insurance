# =========================================================
# INSURANCE PURCHASE PREDICTION USING MACHINE LEARNING
# =========================================================

# =========================================================
# 1. IMPORT LIBRARIES
# =========================================================

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Classification Algorithms
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# Evaluation Metrics
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# =========================================================
# 2. LOAD DATASET
# =========================================================

# Make sure Social_Network_Ads.csv is in the same folder

dataset = pd.read_csv("Social_Network_Ads.csv")

print("\n================ DATASET HEAD ================\n")
print(dataset.head())

print("\n================ DATASET INFO ================\n")
print(dataset.info())

print("\n================ MISSING VALUES ================\n")
print(dataset.isnull().sum())

# =========================================================
# 3. SELECT FEATURES
# =========================================================

# Independent Variables
X = dataset[['Age', 'EstimatedSalary']]

# Dependent Variable
y = dataset['Purchased']

# =========================================================
# 4. TRAIN TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=0
)

# =========================================================
# 5. FEATURE SCALING
# =========================================================

sc = StandardScaler()

X_train = sc.fit_transform(X_train)
X_test = sc.transform(X_test)

# =========================================================
# 6. GRAPHICAL ANALYSIS
# =========================================================

# ---------------------------------------------------------
# A. PURCHASE DISTRIBUTION
# ---------------------------------------------------------

plt.figure(figsize=(6,5))

sns.countplot(x='Purchased', data=dataset)

plt.title("Insurance Purchase Distribution")
plt.xlabel("Purchased")
plt.ylabel("Count")

plt.show()

# ---------------------------------------------------------
# B. AGE VS SALARY
# ---------------------------------------------------------

plt.figure(figsize=(8,6))

sns.scatterplot(
    x='Age',
    y='EstimatedSalary',
    hue='Purchased',
    data=dataset,
    palette='coolwarm'
)

plt.title("Age vs Estimated Salary")
plt.xlabel("Age")
plt.ylabel("Estimated Salary")

plt.show()

# =========================================================
# 7. LOGISTIC REGRESSION
# =========================================================

log_model = LogisticRegression(random_state=0)

log_model.fit(X_train, y_train)

y_pred_log = log_model.predict(X_test)

# =========================================================
# 8. KNN CLASSIFIER
# =========================================================

knn_model = KNeighborsClassifier(n_neighbors=5)

knn_model.fit(X_train, y_train)

y_pred_knn = knn_model.predict(X_test)

# =========================================================
# 9. SUPPORT VECTOR MACHINE
# =========================================================

svm_model = SVC(kernel='rbf', random_state=0)

svm_model.fit(X_train, y_train)

y_pred_svm = svm_model.predict(X_test)

# =========================================================
# 10. DECISION TREE
# =========================================================

dt_model = DecisionTreeClassifier(
    criterion='entropy',
    random_state=0
)

dt_model.fit(X_train, y_train)

y_pred_dt = dt_model.predict(X_test)

# =========================================================
# 11. RANDOM FOREST
# =========================================================

rf_model = RandomForestClassifier(
    n_estimators=100,
    criterion='entropy',
    random_state=0
)

rf_model.fit(X_train, y_train)

y_pred_rf = rf_model.predict(X_test)

# =========================================================
# 12. EVALUATION FUNCTION
# =========================================================

def evaluate_model(name, y_test, y_pred):

    print("\n================================================")
    print(f"{name}")
    print("================================================")

    print("Accuracy :", accuracy_score(y_test, y_pred))
    print("Precision:", precision_score(y_test, y_pred))
    print("Recall   :", recall_score(y_test, y_pred))
    print("F1 Score :", f1_score(y_test, y_pred))

    print("\nCONFUSION MATRIX")
    print(confusion_matrix(y_test, y_pred))

    print("\nCLASSIFICATION REPORT")
    print(classification_report(y_test, y_pred))


# =========================================================
# 13. EVALUATE ALL MODELS
# =========================================================

evaluate_model(
    "LOGISTIC REGRESSION",
    y_test,
    y_pred_log
)

evaluate_model(
    "KNN CLASSIFIER",
    y_test,
    y_pred_knn
)

evaluate_model(
    "SUPPORT VECTOR MACHINE",
    y_test,
    y_pred_svm
)

evaluate_model(
    "DECISION TREE",
    y_test,
    y_pred_dt
)

evaluate_model(
    "RANDOM FOREST",
    y_test,
    y_pred_rf
)

# =========================================================
# 14. COMPARISON TABLE
# =========================================================

results = pd.DataFrame({

    'Model': [
        'Logistic Regression',
        'KNN',
        'SVM',
        'Decision Tree',
        'Random Forest'
    ],

    'Accuracy': [
        accuracy_score(y_test, y_pred_log),
        accuracy_score(y_test, y_pred_knn),
        accuracy_score(y_test, y_pred_svm),
        accuracy_score(y_test, y_pred_dt),
        accuracy_score(y_test, y_pred_rf)
    ],

    'Precision': [
        precision_score(y_test, y_pred_log),
        precision_score(y_test, y_pred_knn),
        precision_score(y_test, y_pred_svm),
        precision_score(y_test, y_pred_dt),
        precision_score(y_test, y_pred_rf)
    ],

    'Recall': [
        recall_score(y_test, y_pred_log),
        recall_score(y_test, y_pred_knn),
        recall_score(y_test, y_pred_svm),
        recall_score(y_test, y_pred_dt),
        recall_score(y_test, y_pred_rf)
    ],

    'F1 Score': [
        f1_score(y_test, y_pred_log),
        f1_score(y_test, y_pred_knn),
        f1_score(y_test, y_pred_svm),
        f1_score(y_test, y_pred_dt),
        f1_score(y_test, y_pred_rf)
    ]
})

print("\n================ MODEL COMPARISON ================\n")
print(results)

# =========================================================
# 15. BEST MODEL SELECTION
# =========================================================

best_model = results.sort_values(
    by='Accuracy',
    ascending=False
)

print("\n================ BEST MODEL ================\n")
print(best_model.head(1))

# =========================================================
# 16. DECISION BOUNDARY VISUALIZATION
# =========================================================

from matplotlib.colors import ListedColormap

def visualize_classifier(X_set, y_set, classifier, title):

    X1, X2 = np.meshgrid(
        np.arange(
            start=X_set[:,0].min()-1,
            stop=X_set[:,0].max()+1,
            step=0.01
        ),

        np.arange(
            start=X_set[:,1].min()-1,
            stop=X_set[:,1].max()+1,
            step=0.01
        )
    )

    plt.contourf(
        X1,
        X2,

        classifier.predict(
            np.array([X1.ravel(), X2.ravel()]).T
        ).reshape(X1.shape),

        alpha=0.75,

        cmap=ListedColormap(('red', 'green'))
    )

    plt.xlim(X1.min(), X1.max())
    plt.ylim(X2.min(), X2.max())

    for i, j in enumerate(np.unique(y_set)):

        plt.scatter(
            X_set[y_set == j, 0],
            X_set[y_set == j, 1],

            c=ListedColormap(('red', 'green'))(i),

            label=j
        )

    plt.title(title)
    plt.xlabel('Age')
    plt.ylabel('Estimated Salary')
    plt.legend()

    plt.show()

# ---------------------------------------------------------
# VISUALIZE RANDOM FOREST
# ---------------------------------------------------------

visualize_classifier(
    X_train,
    y_train,
    rf_model,
    "Random Forest Classification"
)

# =========================================================
# 17. PREDICTIONS - SCENARIO SET 1
# =========================================================

print("\n================ PREDICTIONS SET 1 ================\n")

test_data_1 = pd.DataFrame({

    'Age': [30, 40, 40, 50],

    'EstimatedSalary': [
        87000,
        0,
        100000,
        0
    ]
})

scaled_test_1 = sc.transform(test_data_1)

predictions_1 = rf_model.predict(scaled_test_1)

test_data_1['Prediction'] = predictions_1

print(test_data_1)

# =========================================================
# 18. PREDICTIONS - SCENARIO SET 2
# =========================================================

print("\n================ PREDICTIONS SET 2 ================\n")

test_data_2 = pd.DataFrame({

    'Age': [18, 22, 35, 60],

    'EstimatedSalary': [
        0,
        600000,
        2500000,
        100000000
    ]
})

scaled_test_2 = sc.transform(test_data_2)

predictions_2 = rf_model.predict(scaled_test_2)

test_data_2['Prediction'] = predictions_2

print(test_data_2)

# =========================================================
# 19. HYPOTHESIS TESTING
# =========================================================

print("\n================ HYPOTHESIS TESTING ================\n")

print("Hypothesis:")
print("Higher salary increases insurance purchase probability.\n")

salary_test = pd.DataFrame({

    'Age': [35, 35, 35, 35],

    'EstimatedSalary': [
        10000,
        50000,
        100000,
        500000
    ]
})

scaled_salary_test = sc.transform(salary_test)

salary_predictions = rf_model.predict(scaled_salary_test)

salary_test['Prediction'] = salary_predictions

print(salary_test)


print("\n================ END OF PROJECT ================\n")