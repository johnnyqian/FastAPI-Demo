from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session, select
import uvicorn

from schemas import Car, CarInput, CarOutput, Trip, TripInput

engine = create_engine("sqlite:///cars.db",
    connect_args={"check_same_thread": False}, # only for SQLite
    echo=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

def get_session():
    with Session(engine) as session:
        yield session

app = FastAPI(title="Car Sharing Service", version="1.0.0", lifespan=lifespan)

# @app.on_event("startup")
# def on_startup():
#     SQLModel.metadata.create_all(engine)

@app.get("/api/cars")
async def get_cars(session: Session = Depends(get_session), size : str = None, doors: int = None) -> list[Car]:
    """Get a list of cars."""
    query = select(Car)
    if size:
        query = query.where(Car.size == size)
    if doors:
        query = query.where(Car.doors == doors)
    return session.exec(query).all()

@app.get("/api/cars/{id}")
async def get_car(session: Annotated[Session, Depends(get_session)], id: int) -> CarOutput:
    """Get a car by id."""
    car = session.get(Car, id)
    if car:
        return car
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@app.put("/api/cars/{id}")
async def update_car(session: Annotated[Session, Depends(get_session)], id: int, dto: CarInput) -> Car:
    """Update a car by id."""
    car = session.get(Car, id)
    if car:
        car.fuel = dto.fuel
        car.size = dto.size
        car.doors = dto.doors
        car.transmission = dto.transmission
        session.commit()
        return car
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@app.delete("/api/cars/{id}", status_code=204)
async def delete_car(session: Annotated[Session, Depends(get_session)], id: int) -> None:
    """Delete a car by id."""
    car = session.get(Car, id)
    if car:
        session.delete(car)
        session.commit()
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@app.post("/api/cars")
async def create_car(session: Annotated[Session, Depends(get_session)], car: CarInput) -> Car:
    """Create a new car."""
    new_car = Car.model_validate(car)
    # new_car = Car.from_orm(car)
    session.add(new_car)
    session.commit()
    session.refresh(new_car)
    return new_car

@app.post("/api/cars/{car_id}/trips")
def create_trip(session: Annotated[Session, Depends(get_session)], car_id: int, trip: TripInput) -> Trip:
    """Create a new trip."""
    car = session.get(Car, car_id)
    if car:
        new_trip = Trip.model_validate(trip, update={"car_id": car_id})
        car.trips.append(new_trip)
        session.commit()
        session.refresh(new_trip)
        return new_trip
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@app.get("/")
async def welcome(name: str = "johnny"):
    """Welcome message for the car sharing service."""
    return {"message": f"Welcome {name} to Car Sharing services!"}

if __name__ == "__main__":
    uvicorn.run("carsharing:app", reload=True)
