#!/bin/bash

# Forum API Testing Script
# Tests all endpoints with curl

BASE_URL="http://localhost:5000"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 Forum API Test Suite"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test health check
echo -e "${BLUE}1. Testing Health Check${NC}"
curl -s -X GET "$BASE_URL/api/health" | jq .
echo ""

# Test create thread
echo -e "${BLUE}2. Creating a New Thread${NC}"
THREAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/threads" \
  -H "$CONTENT_TYPE" \
  -d '{
    "title": "Test Thread from Script",
    "content": "This is a test thread created by automation script",
    "author": "WeeTeck"
  }')
echo "$THREAD_RESPONSE" | jq .
THREAD_ID=$(echo "$THREAD_RESPONSE" | jq -r '.id // empty')
echo "Thread ID: $THREAD_ID"
echo ""

# Test get threads
echo -e "${BLUE}3. Getting All Threads${NC}"
curl -s -X GET "$BASE_URL/api/threads?page=1&limit=10" | jq .
echo ""

# Test get single thread (if we have thread_id)
if [ ! -z "$THREAD_ID" ] && [ "$THREAD_ID" != "null" ]; then
  echo -e "${BLUE}4. Getting Single Thread${NC}"
  curl -s -X GET "$BASE_URL/api/threads/$THREAD_ID" | jq .
  echo ""

  # Test create reply
  echo -e "${BLUE}5. Creating a Reply${NC}"
  REPLY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/$THREAD_ID/replies" \
    -H "$CONTENT_TYPE" \
    -d '{
      "content": "This is a test reply with **bold** and *italic* text",
      "author": "TestUser",
      "richContent": {
        "text": "This is a test reply with bold and italic text",
        "formatting": {
          "bold": [{ "start": 25, "end": 29 }],
          "italic": [{ "start": 34, "end": 40 }],
          "codeBlocks": []
        },
        "embeds": []
      }
    }')
  echo "$REPLY_RESPONSE" | jq .
  REPLY_ID=$(echo "$REPLY_RESPONSE" | jq -r '.id // empty')
  echo "Reply ID: $REPLY_ID"
  echo ""

  # Test get replies
  echo -e "${BLUE}6. Getting Replies for Thread${NC}"
  curl -s -X GET "$BASE_URL/api/$THREAD_ID/replies?page=1&limit=20" | jq .
  echo ""

  # Test get single reply (if we have reply_id)
  if [ ! -z "$REPLY_ID" ] && [ "$REPLY_ID" != "null" ]; then
    echo -e "${BLUE}7. Getting Single Reply${NC}"
    curl -s -X GET "$BASE_URL/api/reply/$REPLY_ID" | jq .
    echo ""

    # Test update reply
    echo -e "${BLUE}8. Updating Reply${NC}"
    curl -s -X PUT "$BASE_URL/api/reply/$REPLY_ID" \
      -H "$CONTENT_TYPE" \
      -d '{
        "content": "Updated reply content with more details",
        "richContent": {
          "text": "Updated reply content with more details",
          "formatting": {},
          "embeds": []
        }
      }' | jq .
    echo ""

    # Test delete reply
    echo -e "${BLUE}9. Deleting Reply${NC}"
    curl -s -X DELETE "$BASE_URL/api/reply/$REPLY_ID" | jq .
    echo ""
  fi

  # Test update thread
  echo -e "${BLUE}10. Updating Thread${NC}"
  curl -s -X PUT "$BASE_URL/api/threads/$THREAD_ID" \
    -H "$CONTENT_TYPE" \
    -d '{
      "title": "Updated Thread Title",
      "content": "This thread has been updated with new content"
    }' | jq .
  echo ""

  # Test delete thread
  echo -e "${BLUE}11. Deleting Thread${NC}"
  curl -s -X DELETE "$BASE_URL/api/threads/$THREAD_ID" | jq .
  echo ""
else
  echo -e "${RED}Could not get thread ID. Make sure MongoDB is running.${NC}"
fi

echo -e "${GREEN}✅ Test suite completed!${NC}"
