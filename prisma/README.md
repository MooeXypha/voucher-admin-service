# `prisma/`

Database schema and migrations. Read [Prisma CLI reference](https://www.prisma.io/docs/reference/api-reference/command-reference)
for more information.

```sh
# create first migration
$ npx prisma migrate dev --name init

# create second migration
$ npx prisma migrate dev --name add_users_table

# generate and apply migrations in development
$ npx prisma migrate dev
```
