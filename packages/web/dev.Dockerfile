FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-18

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

USER root

# hadolint ignore=DL3008
RUN apt-get update && \
  apt-get install postgresql-client -y --no-install-recommends && \
  apt-get clean -y && \
  rm -rf /var/lib/apt/lists/* && \
  rm /usr/local/bin/yarn

# hadolint ignore=DL3016
RUN npm install -g pnpm prisma @antfu/ni && \
  chmod a+w /usr/local/share/npm-global/lib/node_modules/prisma

COPY ./packages/crawler/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

RUN echo "db:5432:my-pixiv:my-pixiv:password" > ~/.pgpass && \
  chmod 0600 ~/.pgpass

WORKDIR /apps
