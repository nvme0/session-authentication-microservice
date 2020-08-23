# Session Authentication Microservice

An authentication microservice for session management. Sessions are managed using a Redis Cache.

The purpose of this microservice is to handle authentication seperately from a main server-side application. It is intended to be client facing, likely behind a reverse proxy on the same origin as your application.

## Installation

```bash
  npm install
```

### Requirements

- A database compatible with `typeorm` (this repository supports MySQL or MariaDB out of the box)

- Redis

- Docker (optional)

### Environment Variables

Create a `.env` and `.env.dev` file with the following format:

```bash
APP_PORT=<PORT>
APP_HOST=http://localhost
NODE_ENV=<development || production>
DB_TYPE=<mysql || mariadb>
DB_HOST=<localhost || db || etc...>
DB_PORT=<PORT>
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
SESSION_SECRET=<hash>
SESSION_EXPIRE_TIME_MS=<number>
REDIS_HOST=<localhost || redis || etc...>
REDIS_PORT=<PORT>
```

## Running the app

```bash
# development
  npm run start

# watch mode
  npm run start:dev

# production mode
  npm run start:prod
```

### GraphQL Playground

In development mode, GraphQL playground is accessible at the URL `APP_HOST:APP_PORT/graphql`

## Test

```bash
# unit tests
  npm run test

# e2e tests
  npm run test:e2e

# test coverage
  npm run test:cov
```

## API

This repository uses a GraphQL API.

### Mutations

#### Registration

```ts
register(email: String!, password: String!) {
  status
  errors {
    path
    message
  }
  payload
}
```

#### Login

```ts
login(email: String!, password: String!) {
  status
  errors {
    path
    message
  }
  payload
}
```

After a sucessfull login, you will recieve a HTTP only cookie.

#### Logout

```json
logout
```

### Queries

#### me

```ts
me {
  id
  email
  confirmed
}
```

## License

This project is [MIT licensed](LICENSE).
