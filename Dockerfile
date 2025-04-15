# Adapted from https://turbo.build/repo/docs/handbook/deploying-with-docker
FROM node:lts-alpine AS base

# Assemble a pruned version of the repo containing only what's needed for router
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN yarn global add turbo@^2
COPY . .

RUN turbo prune @fedimint/router --docker

# Install dependencies & build the app
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN yarn turbo run build

# Run the built app with a minimal image
FROM base AS runner
WORKDIR /app

COPY --from=installer /app/apps/router/dist dist

RUN yarn global add serve
CMD serve -s dist
