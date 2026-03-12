from typing import List

import numpy as np
from sklearn.ensemble import RandomForestRegressor


class RiskModel:
    def __init__(self) -> None:
        # Simple RandomForestRegressor trained on synthetic data at startup.
        self.model = RandomForestRegressor(
            n_estimators=50, max_depth=5, random_state=42
        )
        self._train_synthetic()

    def _train_synthetic(self) -> None:
        # Features: [historical_rainfall, pollution_level, flood_risk]
        X: List[List[float]] = []
        y: List[float] = []

        rng = np.random.default_rng(42)
        for _ in range(500):
            rainfall = rng.uniform(20, 200)  # mm
            pollution = rng.uniform(50, 400)  # AQI
            flood_risk = rng.uniform(0, 1)  # probability

            base = 20
            score = (
                base
                + 0.15 * rainfall
                + 0.05 * pollution
                + 40 * flood_risk
                + rng.normal(0, 5)
            )
            score = max(0, min(100, score))

            X.append([rainfall, pollution, flood_risk])
            y.append(score)

        self.model.fit(X, y)

    def predict(
        self,
        historical_rainfall: float,
        pollution_level: float,
        flood_risk: float,
    ) -> float:
        features = np.array([[historical_rainfall, pollution_level, flood_risk]])
        score = float(self.model.predict(features)[0])
        return max(0.0, min(100.0, round(score, 2)))


risk_model = RiskModel()

