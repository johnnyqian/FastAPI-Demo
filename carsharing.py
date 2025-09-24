from fastapi import HTTPException
from fastapi import FastAPI
import uvicorn

from schemas import CarOutput, CarInput
from schemas import load_db, save_db

app = FastAPI(title="Car Sharing Service", version="1.0.0")

db = load_db()

@app.get("/api/cars")
async def get_cars(size : str = None, doors: int = None):
    """Get a list of cars."""
    result = db
    if size:
        result = [car for car in result if car.size == size]
    if doors:
        result = [car for car in result if car.doors == doors]
    return result

@app.get("/api/cars/{id}")
async def get_car(id: int) -> CarOutput:
    """Get a car by id."""
    result = [car for car in db if car.id == id]
    if not result:
        raise HTTPException(status_code=404, detail="Car not found")
    return result[0]

@app.put("/api/cars/{id}")
async def update_car(id: int, dto: CarInput) -> CarOutput:
    """Update a car by id."""
    result = [car for car in db if car.id == id]
    if not result:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # 批量更新属性：遍历dto的所有字段并设置到existing_car
    existing_car = result[0]
    for field_name, field_value in dto.model_dump().items():
        setattr(existing_car, field_name, field_value)
    
    save_db(db)
    return existing_car

@app.delete("/api/cars/{id}", status_code=204)
async def delete_car(id: int) -> None:
    """Delete a car by id."""
    result = [car for car in db if car.id == id]
    if not result:
        raise HTTPException(status_code=404, detail="Car not found")
    db.remove(result[0])
    save_db(db)
    return {"message": "Car deleted"}

@app.post("/api/cars")
async def create_car(car: CarInput) -> CarOutput:
    """Create a new car."""
    car_data = car.model_dump()
    car_data["id"] = len(db) + 1
    new_car = CarOutput.model_validate(car_data)
    db.append(new_car)
    save_db(db)
    return new_car

@app.get("/")
async def welcome(name = ""):
    """Welcome message for the car sharing service."""
    return {"message": f"Welcome {name} to Car Sharing services!"}

if __name__ == "__main__":
    uvicorn.run("carsharing:app", reload=True)
