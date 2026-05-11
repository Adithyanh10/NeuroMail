"""
ML Inference Server — FastAPI entry point.
Serves the email reply generation model via REST API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import predict, health
from app.model.loader import load_model

# Global model reference
_model_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model on startup and release on shutdown."""
    print("Loading email reply model...")
    _model_state["model"] = load_model()
    print("Model loaded successfully.")
    yield
    _model_state.clear()
    print("Model unloaded.")


app = FastAPI(
    title="Email Reply ML Inference Server",
    description="NLP inference service for generating email replies",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, tags=["Prediction"])

# Expose model state to routes via app state
app.state.model_state = _model_state
