def test_reply_increments_thread_count(client):
    thread = client.post("/api/threads", json={
        "title": "T", "content": "C", "username": "bob"
    }).json()
    client.post(f"/api/threads/{thread['id']}/replies", json={
        "content": "nice post", "username": "carol"
    })
    updated = client.get(f"/api/threads/{thread['id']}").json()
    assert updated["reply_count"] == 1