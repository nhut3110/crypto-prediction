from typing import List
from fastapi import FastAPI, HTTPException
from keras.models import load_model
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    prices: List[float]

# Initialize the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to load the trained LSTM model and the scaler
def load_lstm_model_and_scaler(model_path: str, scaler_path: str):
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler

# Function to make a prediction
def make_prediction(model, scaler, data):
    last_data_scaled = scaler.transform(np.array(data).reshape(-1, 1))
    last_data_scaled = np.reshape(last_data_scaled, (1, last_data_scaled.shape[0], 1))
    prediction_scaled = model.predict(last_data_scaled)
    prediction = scaler.inverse_transform(prediction_scaled)
    return prediction.flatten()

@app.post("/predict/{coin}")
async def predict(coin: str, request: PredictionRequest):
    if len(request.prices) < 60:
        raise HTTPException(status_code=400, detail="At least 60 prices are required for the prediction.")
    
    # Determine model and scaler paths based on the coin
    if coin.lower() == 'eth':
        model_path = 'eth_model_and_scaler/eth_model.h5'
        scaler_path = 'eth_model_and_scaler/eth_scaler.gz'
    elif coin.lower() == 'bnb':
        model_path = 'bnb_model_and_scaler/bnb_model.h5'
        scaler_path = 'bnb_model_and_scaler/bnb_scaler.gz'
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported coin: {coin}")

    # Load model and scaler
    model, scaler = load_lstm_model_and_scaler(model_path, scaler_path)

    # Perform the prediction
    prediction = make_prediction(model, scaler, request.prices)
    return {"prediction": prediction.tolist()}
