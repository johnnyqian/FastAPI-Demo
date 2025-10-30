from sqlmodel import Field, Relationship, SQLModel

class TripInput(SQLModel):
    start: int
    end: int
    description: str

class TripOutput(TripInput):
    id: int

class Trip(TripInput, table=True):
    id: int | None = Field(default=None, primary_key=True)
    car_id: int = Field(foreign_key="car.id")
    car: "Car" = Relationship(back_populates="trips")

class CarInput(SQLModel):
    size: str
    fuel: str | None = None
    doors: int | None = None
    transmission: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "size": "m",
                    "doors": 4,
                    "fuel": "Gasoline",
                    "transmission": "Automatic"
                }
            ]
        }
    } # type: ignore

class Car(CarInput, table=True):
    id: int | None = Field(default=None, primary_key=True)
    trips: list[Trip] = Relationship(back_populates="car")

class CarOutput(CarInput):
    id: int
    trips: list[TripOutput] = []
