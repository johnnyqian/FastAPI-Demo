from fastapi import HTTPException
from fastapi import FastAPI
import uvicorn

app = FastAPI()

db = [
    {"id": 1, "size": "s", "fuel": "gasoline", "doors": 3, "transmission": "auto"},
    {"id": 2, "size": "s", "fuel": "electric", "doors": 3, "transmission": "auto"},
    {"id": 3, "size": "s", "fuel": "gasoline", "doors": 5, "transmission": "manual"},
    {"id": 4, "size": "m", "fuel": "electric", "doors": 3, "transmission": "auto"},
    {"id": 5, "size": "m", "fuel": "hybrid", "doors": 5, "transmission": "auto"},
    {"id": 6, "size": "m", "fuel": "gasoline", "doors": 5, "transmission": "manual"},
    {"id": 7, "size": "l", "fuel": "diesel", "doors": 5, "transmission": "manual"},
    {"id": 8, "size": "l", "fuel": "electric", "doors": 5, "transmission": "auto"},
    {"id": 9, "size": "l", "fuel": "hybrid", "doors": 5, "transmission": "auto"}
]

@app.get("/api/cars")
async def get_cars(size : str = None, doors: int = None):
    """Get a list of cars."""
    result = db
    if size:
        result = [car for car in result if car["size"] == size]
    if doors:
        result = [car for car in result if car["doors"] == doors]
    return result

@app.get("/api/cars/{id}")
async def get_car(id: int):
    """Get a car by id."""
    result = [car for car in db if car["id"] == id]
    if not result:
        raise HTTPException(status_code=404, detail="Car not found")
    return result[0]

@app.get("/")
async def welcome(name):
    """Welcome message for the car sharing service."""
    return {"message": f"Welcome {name} to Car Sharing services!"}

if __name__ == "__main__":
    uvicorn.run("carsharing:app", reload=True)
