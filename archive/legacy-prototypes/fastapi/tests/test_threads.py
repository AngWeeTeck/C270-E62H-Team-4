def test_create_and_get_thread(client):
    create_resp = client.post("/api/threads", json={
        "title": "Hello", "content": "World", "username": "alice",
    })
    assert create_resp.status_code == 200
    thread_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/threads/{thread_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Hello"

def test_get_missing_thread_404(client):
    resp = client.get("/api/threads/does-not-exist")
    assert resp.status_code == 404