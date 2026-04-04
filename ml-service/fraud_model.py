from typing import List

import numpy as np
from sklearn.ensemble import IsolationForest


class FraudModel:
    def __init__(self) -> None:
        # Features: [trigger_value, rainfall, temperature, aqi]
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42,
        )
        self._train_synthetic()

    def _train_synthetic(self) -> None:
        rng = np.random.default_rng(123)
        X: List[List[float]] = []

        # Normal claims
        for _ in range(800):
            trigger_value = rng.uniform(60, 150)
            rainfall = rng.uniform(0, 150)
            temperature = rng.uniform(20, 45)
            aqi = rng.uniform(50, 400)
            X.append([trigger_value, rainfall, temperature, aqi])

        # Synthetic anomalous claims
        for _ in range(80):
            trigger_value = rng.uniform(0, 20)
            rainfall = rng.uniform(0, 20)
            temperature = rng.uniform(10, 20)
            aqi = rng.uniform(0, 50)
            X.append([trigger_value, rainfall, temperature, aqi])

        self.model.fit(X)

    def fraud_score(
        self,
        trigger_value: float,
        rainfall: float,
        temperature: float,
        aqi: float,
    ) -> float:
        features = np.array([[trigger_value, rainfall, temperature, aqi]])
        # IsolationForest: -1 is anomaly, 1 is normal
        decision = self.model.decision_function(features)[0]
        # Map decision scores (~[-0.5, 0.5]) to [0, 1] where 1 = high fraud risk
        fraud = 1.0 - (decision + 0.5)
        return float(max(0.0, min(1.0, round(fraud, 3))))


fraud_model = FraudModel()

