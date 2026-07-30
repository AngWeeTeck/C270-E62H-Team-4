FROM node:20.20.1-alpine3.23

RUN apk update && apk upgrade --no-cache

RUN npm install -g npm@11.18.0

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

RUN npm cache clean --force

COPY backend ./backend

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "backend/server.js"]
