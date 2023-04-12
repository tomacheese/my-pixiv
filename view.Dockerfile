FROM node:19-alpine as builder

# ----- common start ----- #

WORKDIR /build

COPY package.json package.json
COPY yarn.lock yarn.lock

# -- types directory
WORKDIR /build/types

COPY types/ .

# -- view directory
WORKDIR /build/view

COPY view/package.json package.json
COPY view/tsconfig.json tsconfig.json

# -- install dependencies

WORKDIR /build

RUN echo network-timeout 600000 > .yarnrc && \
  yarn install --frozen-lockfile --non-interactive

# -- regenerate types index

WORKDIR /build/types

RUN yarn generate

# ----- common end ----- #

# -- build view
WORKDIR /build/view

COPY view/nuxt.config.ts nuxt.config.ts
COPY view/src/ src/

RUN yarn build && \
  yarn generate

# ----- final image ----- #
FROM nginx:1.24.0-alpine

COPY view/nginx-template.conf /etc/nginx/templates/default.conf.template

ENV NGINX_HOST=localhost
ENV NGINX_PORT=80

COPY --from=builder /build/view/dist /usr/share/nginx/html
