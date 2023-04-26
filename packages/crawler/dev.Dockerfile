FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-18

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

USER root

# hadolint ignore=DL3008
RUN apt-get update && \
  apt-get install mariadb-client -y --no-install-recommends && \
  apt-get clean -y && \
  rm -rf /var/lib/apt/lists/*

COPY ./.devcontainer/my.cnf /etc/my.cnf

# hadolint ignore=DL3016
RUN npm install -g pnpm prisma @antfu/ni

COPY ./packages/crawler/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

WORKDIR /tmp/prisma
COPY ./packages/db/prisma/schema.prisma schema.prisma

WORKDIR /apps
