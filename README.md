## Description

LMS Backend

## Installation

```bash
$ npm install
```

Add .env

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/lms?schema=public"
JWT_ACCESS_SECRET="773026b5cce26..."
JWT_REFRESH_SECRET="31d4c06894f79..."
ARGON2_SECRET="2fe83e2826d47..."
GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT = '{"type":"service_account",...'
GOOGLE_CLOUD_STORAGE_BUCKET="lms"
```

After any Schema modification (_prisma/schema.prisma_) run

1. `npx prisma format`
2. `npx prisma migrate dev --name :migartion_name`

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
