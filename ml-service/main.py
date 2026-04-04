from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

from risk_model import risk_model
from fraud_model import fraud_model


class RiskRequest(BaseModel):
    city: str
    historical_weather: float = Field(..., description="Historical rainfall (mm)")
    pollution_level: float = Field(..., description="Average AQI")
    flood_risk: float = Field(..., ge=0, le=1, description="Flood probability 0-1")


class RiskResponse(BaseModel):
    risk_score: float


class FraudRequest(BaseModel):
    user_id: str
    claim_id: str
    city: str
    zone: str
    trigger_type: str
    trigger_value: float
    rainfall: float
    temperature: float
    aqi: float


class FraudResponse(BaseModel):
    fraud_score: float


app = FastAPI(title="Earn Shield AI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Earn Shield AI ML service up"}


@app.post("/risk-score", response_model=RiskResponse)
def get_risk_score(payload: RiskRequest):
    score = risk_model.predict(
        payload.historical_weather,
        payload.pollution_level,
        payload.flood_risk,
    )
    return RiskResponse(risk_score=score)


@app.post("/fraud-score", response_model=FraudResponse)
def get_fraud_score(payload: FraudRequest):
    score = fraud_model.fraud_score(
        trigger_value=payload.trigger_value,
        rainfall=payload.rainfall,
        temperature=payload.temperature,
        aqi=payload.aqi,
    )
    return FraudResponse(fraud_score=score)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

