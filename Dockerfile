# Adapted from https://turbo.build/repo/docs/handbook/deploying-with-docker
FROM node:lts-alpine AS base

# Assemble a pruned version of the repo containing only what's needed for router
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune @fedimint/router --docker

# Install dependencies & build the app
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --from=builder /app/out/full/ .
# TODO: Remove this copy once https://github.com/vercel/turbo/issues/3758 is fixed
COPY ./turbo.json .
RUN yarn build

# Run the built app with a minimal image
FROM base AS runner
WORKDIR /app

# note: remember to make changes to the installPhase in flake.nix as well
COPY --from=installer /app/apps/router/build build
COPY scripts/replace-react-env.js scripts/replace-react-env.js
COPY scripts/write-config-from-env.js scripts/write-config-from-env.js
RUN yarn global add serve
CMD node scripts/write-config-from-env.js build && serve -s build
