import json
from pydantic import BaseModel

class CarInput(BaseModel):
    size: str
    fuel: str | None = None
    doors: int | None = None
    transmission: str | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "size": "m",
                "fuel": "Gasoline",
                "doors": 4,
                "transmission": "Automatic"
            }
        }
    }

class CarOutput(CarInput):
    id: int

def load_db() -> list[CarOutput]:
    """Load a list of cars from a JSON file."""
    with open("cars.json", "r") as f:
        data = json.load(f)
    # return [Car(**car) for car in data]
    return [CarOutput.model_validate(car) for car in data]

def save_db(cars: list[CarOutput]) -> None:
    """Save a list of cars to a JSON file."""
    with open("cars.json", "w") as f:
        json.dump([car.model_dump() for car in cars], f, indent=4)
