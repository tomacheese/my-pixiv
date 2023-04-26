#!/bin/sh

cd /apps || exit
pnpm install

cd /apps/packages/db || exit
prisma db push --skip-generate

cd /apps || exit