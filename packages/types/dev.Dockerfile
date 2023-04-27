FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

USER root

# hadolint ignore=DL3008
RUN apt-get update && \
  apt-get install postgresql-client -y --no-install-recommends && \
  apt-get clean -y && \
  rm -rf /var/lib/apt/lists/*

USER node

RUN echo "db:5432:my-pixiv:my-pixiv:password" > ~/.pgpass && \
  chmod 0600 ~/.pgpass
