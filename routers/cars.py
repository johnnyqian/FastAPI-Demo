from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from schemas import Car, CarInput, CarOutput, Trip, TripInput

router = APIRouter(prefix="/api/cars")

@router.get("/")
async def get_cars(session: Session = Depends(get_session), size : str | None = None, doors: int | None = None) -> list:
    """Get a list of cars."""
    query = select(Car)
    if size:
        query = query.where(Car.size == size)
    if doors:
        query = query.where(Car.doors == doors)
    return session.exec(query).all()  # type: ignore

@router.get("/{id}")
async def get_car(session: Annotated[Session, Depends(get_session)], id: int) -> CarOutput:
    """Get a car by id."""
    car = session.get(Car, id)
    if car:
        return car
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@router.put("/{id}")
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

@router.delete("/{id}", status_code=204)
async def delete_car(session: Annotated[Session, Depends(get_session)], id: int) -> None:
    """Delete a car by id."""
    car = session.get(Car, id)
    if car:
        session.delete(car)
        session.commit()
    else:
        raise HTTPException(status_code=404, detail="Car not found")

@router.post("/")
async def create_car(session: Annotated[Session, Depends(get_session)], car: CarInput) -> Car:
    """Create a new car."""
    new_car = Car.model_validate(car)
    # new_car = Car.from_orm(car)
    session.add(new_car)
    session.commit()
    session.refresh(new_car)
    return new_car

@router.post("/{car_id}/trips")
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
