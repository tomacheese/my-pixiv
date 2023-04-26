FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

USER root

# hadolint ignore=DL3008
RUN apt-get update && \
  apt-get install mariadb-client -y --no-install-recommends && \
  apt-get clean -y && \
  rm -rf /var/lib/apt/lists/*

COPY ./.devcontainer/my.cnf /etc/my.cnf

USER node
