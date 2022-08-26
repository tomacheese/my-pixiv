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

FROM python:3.9.13-bullseye

RUN export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y --no-install-recommends \
  libblas-dev \
  liblapack-dev \
  # cython \
  gfortran \
  # gfortran-4.9 \
  # libgfortran-4.9-dev \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api api

COPY --from=builder /build/dist view

WORKDIR /app

ENV NODE_ENV production

ENTRYPOINT [ "python", "-m", "api" ]
