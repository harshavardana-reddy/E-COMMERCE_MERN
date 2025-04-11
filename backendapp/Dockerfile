# Build stage
FROM node:16 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage
FROM node:16-alpine

WORKDIR /app
COPY --from=builder /app .

ENV PORT=5000
ENV NODE_ENV=production

# Install production dependencies only
RUN npm install --production

EXPOSE 5000

CMD ["npm", "start"]