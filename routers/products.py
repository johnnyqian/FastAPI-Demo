from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from routers.auth import get_current_user

from schemas import Product, ProductInput, ProductOutput, User

router = APIRouter(prefix="/api/products")

@router.get("/")
async def get_products(session: Session = Depends(get_session),
    category : str | None = None, in_stock: bool | None = None) -> list:
    """Get a list of products."""
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if in_stock:
        query = query.where(Product.stock > 0)
    return session.exec(query).all()  # type: ignore

@router.get("/{id}")
async def get_product(session: Annotated[Session, Depends(get_session)], id: int) -> ProductOutput:
    """Get a product by id."""
    product = session.get(Product, id)
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@router.put("/{id}")
async def update_product(session: Annotated[Session, Depends(get_session)], id: int, dto: ProductInput) -> Product:
    """Update a product by id."""
    product = session.get(Product, id)
    if product:
        product.name = dto.name
        product.price = dto.price
        product.category = dto.category
        product.stock = dto.stock
        session.commit()
        return product
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@router.delete("/{id}", status_code=204)
async def delete_product(session: Annotated[Session, Depends(get_session)], id: int) -> None:
    """Delete a product by id."""
    product = session.get(Product, id)
    if product:
        session.delete(product)
        session.commit()
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@router.post("/")
async def add_product(session: Annotated[Session, Depends(get_session)],
        user: Annotated[User, Depends(get_current_user)],
        product: ProductInput) -> Product:
    """Create a new product."""
    new_product = Product.model_validate(product)
    session.add(new_product)
    session.commit()
    session.refresh(new_product)
    return new_product
