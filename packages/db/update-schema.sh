#!/bin/sh
cd /apps/packages/db
nr db:migrate
nr db:generate
nr db:push
nr db:generate-pu

sed -i 's/@startuml/@startuml schema/g' /apps/packages/db/prisma/schema.pu
sed -i -z 's/skinparam linetype ortho\n\n//g' /apps/packages/db/prisma/schema.pu
sed -i 's/\.\./--/g' /apps/packages/db/prisma/schema.pu

echo "Please check PlantUML. Check especially for relations!"
code /apps/packages/db/prisma/schema.pu
