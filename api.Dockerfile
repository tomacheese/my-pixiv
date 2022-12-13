FROM node:18-alpine as builder

# ----- common start ----- #

WORKDIR /build

COPY package.json package.json
COPY yarn.lock yarn.lock

# -- types directory
WORKDIR /build/types

COPY types/ .

# -- api directory
WORKDIR /build/api

COPY api/ .

# -- install dependencies

WORKDIR /build

RUN echo network-timeout 600000 > .yarnrc && \
  yarn install --frozen-lockfile --non-interactive

# -- regenerate types index

WORKDIR /build/types

RUN yarn generate

# ----- common end ----- #

# -- compile api

WORKDIR /build

RUN yarn workspace my-pixiv-api compile && \
  yarn workspace my-pixiv-api package

# ----- final image ----- #
FROM node:18-alpine

COPY --from=builder /build/api/output /app

WORKDIR /app

ENV PORT=80

CMD ["node", "index.js"]