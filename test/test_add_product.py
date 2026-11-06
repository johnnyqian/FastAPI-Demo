from unittest.mock import Mock
from fastapi.testclient import TestClient
import pytest

from main import app
from routers.products import add_product
from schemas import ProductInput, User, Product

def test_add_product():
    with TestClient(app) as client:
        response = client.post("/api/products/",
            json={
                "name": "Phone charger",
                "price": 19.99,
                "category": "Electronics",
                "stock": 7
            }, headers={'Authorization': 'Bearer admin'}
        )
    assert response.status_code == 200
    product = response.json()
    assert product['name'] == 'Phone charger'
    assert product['stock'] == 7

@pytest.mark.asyncio
async def test_add_product_with_mock_session():
    mock_session = Mock()
    input = ProductInput(name="USB cable", price=4.99)
    user = User(username="admin")
    result = await add_product(product=input, session=mock_session, user=user)

    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()
    assert isinstance(result, Product)
    assert result.name == "USB cable"
    assert result.price == 4.99
