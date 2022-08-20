FROM node:16-alpine as builder

WORKDIR /build

COPY view/package.json package.json
COPY view/yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

COPY view/src src
COPY view/nuxt.config.ts nuxt.config.ts
COPY view/tsconfig.json tsconfig.json

RUN yarn build && \
  yarn generate

FROM python:3.10.6-alpine3.16

RUN apk update && \
  apk add --no-cache nodejs yarn && \
  rm -rf /var/cache/apk/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api api

COPY --from=builder /build/dist view

WORKDIR /app

ENV NODE_ENV production

ENTRYPOINT [ "python", "-m", "api" ]
