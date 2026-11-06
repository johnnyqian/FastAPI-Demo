from sqlmodel import VARCHAR, Column, Field, Relationship, SQLModel
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserOutput(SQLModel):
    id: int
    username: str

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column(VARCHAR, unique=True, index=True))
    password_hash: str | None = None

    def set_password(self, password: str):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password: str):
        return pwd_context.verify(password, self.password_hash)

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

class ProductInput(SQLModel):
    name: str
    price: float | None = None
    category: str | None = None
    stock: int | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Phone charger",
                    "price": 19.99,
                    "category": "Electronics",
                    "stock": 100
                }
            ]
        }
    } # type: ignore

class Product(ProductInput, table=True):
    id: int | None = Field(default=None, primary_key=True)

class ProductOutput(ProductInput):
    id: int