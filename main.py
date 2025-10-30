from typing import Annotated, Sequence
from fastapi import Depends, HTTPException
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from sqlmodel import SQLModel, select
import uvicorn

from db import engine
from routers import cars

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title="Car Sharing Service", version="1.0.0", lifespan=lifespan)

# @app.on_event("startup")
# def on_startup():
#     SQLModel.metadata.create_all(engine)

@app.get("/")
async def welcome(name: str = "johnny"):
    """Welcome message for the car sharing service."""
    return {"message": f"Welcome {name} to Car Sharing services!"}

app.include_router(cars.router)

if __name__ == "__main__":
    uvicorn.run("carsharing:app", reload=True)
