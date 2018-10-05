FROM node:8-alpine as builder

WORKDIR /order-app
COPY order-app/package.json package.json
RUN npm install
COPY order-app ./
RUN npm run build

WORKDIR /analytics-app
COPY analytics-app/package.json package.json
RUN npm install
COPY analytics-app ./
RUN npm run build

FROM abiosoft/caddy:0.11.0

WORKDIR /html
COPY --from=builder /order-app/build order-app/
COPY --from=builder /analytics-app/build analytics-app/
