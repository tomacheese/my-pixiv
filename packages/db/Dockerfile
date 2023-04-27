FROM postgres:15.2

COPY ./packages/db/docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

HEALTHCHECK \
  --interval=2s \
  --timeout=5s \
  --retries=5 \
  CMD pg_isready -U "${POSTGRES_USER:-postgres}" || exit 1
