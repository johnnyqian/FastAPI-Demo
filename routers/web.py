from typing import Annotated

from fastapi import APIRouter, Request, Form, Depends, Cookie
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from sqlmodel import Session

from db import get_session
from routers.cars import get_cars

router = APIRouter()

templates = Jinja2Templates(directory="templates")

@router.get("/", response_class=HTMLResponse)
def home(request: Request,
     # cars_cookie: str = Cookie(None),
     cars_cookie: Annotated[str | None, Cookie()] = None):
     print(cars_cookie)
     return templates.TemplateResponse("home.html",{"request": request})


@router.post("/search", response_class=HTMLResponse)
async def search(size: Annotated[str, Form()],
     doors: Annotated[int, Form()],
     request: Request,
     session: Annotated[Session, Depends(get_session)]):
     cars = await get_cars(size=size, doors=doors, session=session)
     return templates.TemplateResponse("results.html", {"request": request, "cars": cars})
