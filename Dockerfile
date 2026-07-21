FROM node:20-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "backend/server.js"]
