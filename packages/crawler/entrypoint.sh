#!/bin/sh

cd /apps || exit
pnpm install

cd /tmp || exit
prisma db push --skip-generate

cd /apps || exit