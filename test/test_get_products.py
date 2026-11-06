from fastapi.testclient import TestClient

from main import app

def test_get_products():
    with TestClient(app) as client:
        response = client.get("/api/products/")
    assert response.status_code == 200
    products = response.json()
    assert all(["name" in p for p in products])
    assert all(["price" in p for p in products])

def test_get_products_filtered_by_category():
    with TestClient(app) as client:
        response = client.get("/api/products/", params={"category": "Electronics"})
    assert response.status_code == 200
    products = response.json()
    assert all([p["category"] == "Electronics" for p in products])
