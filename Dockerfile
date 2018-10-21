FROM node:8-alpine as builder

ARG HGE_HOSTNAME
ARG PAY_ALL_URL
ARG MAKE_PAYMENT_URL
ARG ORDER_APP_URL
ARG ANALYTICS_APP_URL

ENV HGE_HOSTNAME=${HGE_HOSTNAME}
ENV PAY_ALL_URL=${PAY_ALL_URL}
ENV MAKE_PAYMENT_URL=${MAKE_PAYMENT_URL}

# build order app
ENV  PUBLIC_URL=${ORDER_APP_URL}
WORKDIR /order-app
COPY order-app/package.json package.json
RUN npm install
COPY order-app ./
RUN npm run build

# build analytics app
ENV PUBLIC_URL=${ANALYTICS_APP_URL}
WORKDIR /analytics-app
COPY analytics-app/package.json package.json
RUN npm install
COPY analytics-app ./
RUN npm run build

FROM abiosoft/caddy:0.11.0

WORKDIR /html
COPY --from=builder /order-app/build order-app/
COPY --from=builder /analytics-app/build analytics-app/
