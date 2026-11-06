import uvicorn

from typing import Annotated, Sequence
from fastapi import Depends, HTTPException, Request, status
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from db import engine
from routers import cars, web, auth, products
from routers.cars import BadTripException

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title="Car Sharing Service", version="1.0.0", lifespan=lifespan)

# @app.on_event("startup")
# def on_startup():
#     SQLModel.metadata.create_all(engine)

# @app.get("/", response_class=HTMLResponse)
# async def welcome(name: str = "johnny"):
#     """Welcome message for the car sharing service."""
#     return f"Welcome {name} to Car Sharing services!"

app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(products.router)
app.include_router(web.router)

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(BadTripException)
async def bad_trip_exception_handler(request, exc: BadTripException):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"message": str(exc)},
    )

@app.middleware("http")
async def add_cars_cookie(request: Request, call_next):
    response = await call_next(request)
    response.set_cookie(key="cars_cookie", value="visited")
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
