# API Testing Guide

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB running on `mongodb://localhost:27017/forum_db`
- `jq` installed for JSON formatting (optional)

## Quick Start

### Option 1: Run Auto Test Script

```bash
# Make script executable
chmod +x test-api.sh

# Run all tests
./test-api.sh
```

### Option 2: Use Postman

1. Import `API_TESTS.postman_collection.json` into Postman
2. Set variables:
   - `base_url`: `http://localhost:5000`
   - `thread_id`: (Get from first thread creation)
   - `reply_id`: (Get from first reply creation)
3. Run requests in sequence

### Option 3: Manual cURL Testing

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{"status":"ok"}
```

---

### 2. Threads API

#### Create Thread

**Endpoint:** `POST /api/threads`

```bash
curl -X POST http://localhost:5000/api/threads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Forum",
    "content": "This is the first thread!",
    "author": "WeeTeck"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Welcome to Forum",
  "content": "This is the first thread!",
  "author": "WeeTeck",
  "replies": [],
  "replyCount": 0,
  "createdAt": "2026-06-29T06:50:00.000Z",
  "updatedAt": "2026-06-29T06:50:00.000Z"
}
```

#### Get All Threads

**Endpoint:** `GET /api/threads`

```bash
curl "http://localhost:5000/api/threads?page=1&limit=10"
```

**Response:**
```json
{
  "threads": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Welcome to Forum",
      "content": "This is the first thread!",
      "author": "WeeTeck",
      "replyCount": 2,
      "createdAt": "2026-06-29T06:50:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Single Thread

**Endpoint:** `GET /api/threads/:threadId`

```bash
curl "http://localhost:5000/api/threads/550e8400-e29b-41d4-a716-446655440000"
```

#### Update Thread

**Endpoint:** `PUT /api/threads/:threadId`

```bash
curl -X PUT "http://localhost:5000/api/threads/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

#### Delete Thread

**Endpoint:** `DELETE /api/threads/:threadId`

```bash
curl -X DELETE "http://localhost:5000/api/threads/550e8400-e29b-41d4-a716-446655440000"
```

---

### 3. Replies API

#### Create Reply

**Endpoint:** `POST /api/:threadId/replies`

```bash
curl -X POST "http://localhost:5000/api/550e8400-e29b-41d4-a716-446655440000/replies" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great thread!",
    "author": "User123",
    "richContent": {
      "text": "Great thread!",
      "formatting": {
        "bold": [],
        "italic": [],
        "codeBlocks": []
      },
      "embeds": []
    }
  }'
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Great thread!",
  "author": "User123",
  "richContent": {...},
  "createdAt": "2026-06-29T06:52:00.000Z",
  "updatedAt": "2026-06-29T06:52:00.000Z"
}
```

#### Get Replies for Thread

**Endpoint:** `GET /api/:threadId/replies`

```bash
curl "http://localhost:5000/api/550e8400-e29b-41d4-a716-446655440000/replies?page=1&limit=20"
```

#### Get Single Reply

**Endpoint:** `GET /api/reply/:replyId`

```bash
curl "http://localhost:5000/api/reply/660e8400-e29b-41d4-a716-446655440000"
```

#### Update Reply

**Endpoint:** `PUT /api/reply/:replyId`

```bash
curl -X PUT "http://localhost:5000/api/reply/660e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated reply",
    "richContent": {...}
  }'
```

#### Delete Reply

**Endpoint:** `DELETE /api/reply/:replyId`

```bash
curl -X DELETE "http://localhost:5000/api/reply/660e8400-e29b-41d4-a716-446655440000"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Title, content, and author are required"
}
```

### 404 Not Found

```json
{
  "error": "Thread not found"
}
```

### 500 Server Error

```json
{
  "error": "Internal server error message"
}
```

---

## Rich Content Example

When creating or updating replies with rich content:

```json
{
  "content": "Text with formatting",
  "author": "User",
  "richContent": {
    "text": "Text with formatting",
    "formatting": {
      "bold": [
        { "start": 10, "end": 14 }
      ],
      "italic": [
        { "start": 15, "end": 25 }
      ],
      "codeBlocks": [
        { "start": 26, "end": 40, "language": "javascript" }
      ]
    },
    "embeds": [
      {
        "type": "youtube",
        "url": "https://youtube.com/watch?v=...",
        "title": "Video Title"
      },
      {
        "type": "pdf",
        "url": "https://example.com/doc.pdf",
        "title": "Document"
      },
      {
        "type": "image",
        "url": "https://example.com/image.jpg",
        "title": "Image Alt Text"
      }
    ]
  }
}
```

---

## Testing Workflow

### 1. Start Services

```bash
# Option A: Docker Compose
docker-compose up -d

# Option B: Manual
# Terminal 1: MongoDB
# Terminal 2: Node backend
cd backend && npm start
```

### 2. Verify Health

```bash
curl http://localhost:5000/api/health
```

### 3. Run Test Script

```bash
chmod +x test-api.sh
./test-api.sh
```

### 4. View Results

- Check for `✅` marks
- Review JSON responses
- Verify data persists in MongoDB

---

## Troubleshooting

### MongoDB Connection Timeout

```
Error: "Operation `threads.find()` buffering timed out after 10000ms"
```

**Solution:** Ensure MongoDB is running
```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 mongo:7.0-alpine
```

### Port Already in Use

```bash
# Check what's using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001 npm start
```

### CORS Issues

Update `backend/server.js` to allow your frontend domain:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

---

## Performance Tips

1. **Pagination** - Always use page/limit parameters for large datasets
2. **Indexes** - MongoDB automatically indexes by createdAt and author
3. **Validation** - Server validates all input before processing
4. **Error Handling** - Check error responses for validation issues

---

## Next Steps

1. Run `./test-api.sh` to verify all endpoints
2. Import Postman collection for interactive testing
3. Connect frontend to API using base URL `http://localhost:5000`
4. Deploy with Docker for production
