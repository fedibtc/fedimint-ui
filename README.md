# Fedimint UI Projects

## What's Inside

This project includes the following apps / packages:

### Apps

- `guardian-ui`: Web app experience for setting up and administering fedimints. This is used by the Fedimint guardians
- `gateway-ui`: Web app experience for managing Fedimint gateways. This is used by Gateway administrators

### Packages

- `ui`: Shared React UI component library for building Fedimint UI experiences
- `eslint-config`: Shared `eslint` configurations (includes `eslint-plugin-react` and `eslint-config-prettier`)
- `tsconfig`: Shared `tsconfig.json`s used throughout Fedimint UI apps

## Development

From root repo directory:

1. Ensure Docker and yarn/nodejs are installed.
1. Run `docker compose up` (brings up a 2 server Fedimint)
1. `yarn install` (First time only)
1. `yarn build` (Needs to be rerun when code in `packages` change)
1. You can run any of the following commands during development

- `yarn dev` - Runs docker compose scripts for Guardian and Gateway UI development
  - There are targeted dev scripts below:
    - `yarn dev:gateway` - Runs devimint scripts for gateway development
    - `yarn dev:guardian`- Runs devimint scripts for guardian ui development
- `yarn test` - Tests all apps and packages in the project
- `yarn build` - Build all apps and packages in the project
- `yarn clean` - Cleans previous build outputs from all apps and packages in the project
- `yarn format` - Fixes formatting in all apps and packages in the project

### Running the Fedimint Config again

After running through the config setup UI flow once, you will need to delete the `fedimintd` data to run through it again. To do this, delete the `fm_1` and `fm_2` folder from the repo. These are data directories mounted to Docker containers running fedmintd and are listed in `.gitignore` so are safe to remove.

### Running with mprocs

1. Install [mprocs](https://github.com/pvolok/mprocs)
1. Run `mprocs -c mprocs.yml`

After running this command, you'll be present with the mprocs display. Along the left side are the list of processes currently available by mprocs. Along the bottom are hotkeys for navigating/interacting with mprocs. The main pane shows the shell output for the currently selected process.

The `start-servers` process shows combined logging for `fedimintd`, `bitcoind`, `gatewayd`, and `lnd`.

The `stop-servers` process can be used to stop all docker containers by hitting the `s` key to start the process. After doing so, you can return to the `start-servers` process and hit `r` to restart things.

The `guardian-ui-1` and `guardian-ui-2` are instances of `guardian-ui` apps, each running on different ports and connected to a unique `fedimintd` server instance (running in the `start-servers` process).

The `gateway-ui` is an instance of `gateway-ui` app, connected to a `gatewayd` server instance (running in the `start-servers` process).

You can see more details by viewing the `mprocs.yml` file.
