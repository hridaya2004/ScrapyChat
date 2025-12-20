FROM node:alpine

WORKDIR /app

COPY apps/backend/auth/package.json ./auth/package.json
COPY apps/backend/auth ./auth

WORKDIR /app/auth

RUN npm install
RUN npm install zod better-auth @better-auth/cli

EXPOSE 3001

CMD ["sh", "-c", "npm run setup-db && node src/server.ts"]
