import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # reads .env

app = FastAPI()

# Read allowed origins from env (comma separated)
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Danish is learning 🚀"}

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.get("/config")
def config_check():
    # Just to verify env vars are loading
    return {
        "env": os.getenv("ENV_NAME", "not-set"),
        "cors_origins": origins,
    }
