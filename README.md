# Fedimint UI

The Fedimint UI enables you to administer your Guardian from the browser. Once you're running an instance of fedimintd, you can use the UI to connect to this instance and run the setup process.

> If you would like to contribute to this project then please take a look at our [CONTRIBUTING](CONTRIBUTING.md) licence first.

## Quick Start

### Option 1 - Docker Desktop

Using Docker Desktop is a quick and easy way to get started. Run the following commands:

```bash
docker image pull --platform linux/amd64 fedimintui/fedimint-ui:0.5.0
```

```bash
docker run -p 3000:3000 --platform linux/amd64 fedimintui/fedimint-ui:0.5.0
```

The `--platform linux/amd64` flag is typically only required if you're using a Mac with an M chip.

You can now navigate to `http://localhost:3000` in your browser and connect to your fedimintd service.

### Option 2 - Source

You can also run the UI from source locally. Clone the repo using the following command:

```bash
git clone git@github.com:fedimint/fedimint-ui.git fedimint-ui
```

Then install the npm packages by running the following command from the root directory:

```bash
yarn
```

And to launch the project on localhost in your browser run:

```bash
yarn dev
```

## Advanced Options

The development password for the gateway is `theresnosecondbest`.
The development password for the guardians when using the `nix-gateway` or `docker` development environments is `pass`.

### Option 1 - Running with Nix (preferred)

1. Install Nix
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
   ```
1. Add `experimental-features = nix-command flakes` to your `/etc/nix/nix.conf` file
1. In terminal `cd` to the fedimint-ui repo root directory
1. Enter the following command to start Nix development environment
   ```bash
   nix develop
   ```
1. Run `yarn nix-gateway` or `yarn nix-guardian` Note: **nix-gateway** preconfigures the federation so you don't have to go through federation setup. **nix-guardian** starts separate guardian nodes that are connected into the federation when you run through the federation setup process.

#### **Gateway UI**

```bash
yarn nix-gateway
```

nix-gateway spins up these instances
| instance | url |
| ---------- | --- |
| gateway-ui-cln | http://127.0.0.1:3004/ |
| gateway-ui-lnd | http://127.0.0.1:3005/ |
| gateway-ui-ldk | http://127.0.0.1:3006/ |
| guardian-ui | http://127.0.0.1:3000/ |

#### **Guardian UI**

```bash
yarn nix-guardian
```

nix-guardian spins up these instances
| instance | url |
| ------------- | --- |
| guardian-ui-1 | http://127.0.0.1:3000/ |
| guardian-ui-2 | http://127.0.0.1:3001/ |
| guardian-ui-3 | http://127.0.0.1:3002/ |
| guardian-ui-4 | http://127.0.0.1:3003/ |

### Option 2 - Running with docker

1. Install [mprocs](https://github.com/pvolok/mprocs)
1. In terminal `cd` to the fedimint-ui repo root directory and run `yarn install`
1. Run `yarn docker`

After running this command, you'll be present with the mprocs display. Along the left side are the list of processes currently available by mprocs. Along the bottom are hotkeys for navigating/interacting with mprocs. The main pane shows the shell output for the currently selected process.

The `start-servers` process shows combined logging for `fedimintd`, `bitcoind`, `gatewayd`, and `lnd`.

The `stop-servers` process can be used to stop all docker containers by hitting the `s` key to start the process. After doing so, you can return to the `start-servers` process and hit `r` to restart things.

The `guardian-ui-1`, `guardian-ui-2`, `guardian-ui-3`, `guardian-ui-4` are instances of `guardian-ui` apps, each running on different ports and connected to a unique `fedimintd` server instance (running in the `start-servers` process).

The `gateway-ui` is an instance of `gateway-ui` app, connected to a `gatewayd` server instance (running in the `start-servers` process).

You can see more details by viewing the `mprocs.yml` file.

yarn mprocs spins up these instances
| instance | url |
| ------------- | --- |
| guardian-ui-1 | http://127.0.0.1:3000/ |
| guardian-ui-2 | http://127.0.0.1:3001/ |
| guardian-ui-3 | http://127.0.0.1:3002/ |
| guardian-ui-4 | http://127.0.0.1:3003/ |
| gateway-ui | http://127.0.0.1:3004/ |

<!-- TODO: Fix this section... these instructions are outdated
### Option 3 - Running with Docker Compose and Yarn manually

From root repo directory:

1. Ensure Docker and yarn/nodejs are installed.
1. Run `docker compose up` - runs 4 fedimintd servers and a gatewayd server, plus associated services. See [compose file for details](./docker-compose.yml)
1. `yarn install` (first time only)
1. Run guardian-ui in development environment

   ```bash
     # first guardian
     PORT=3000 REACT_APP_FM_CONFIG_API="ws://127.0.0.1:18174" yarn dev:guardian-ui
     # second guardian
     PORT=3001 REACT_APP_FM_CONFIG_API="ws://127.0.0.1:18184" yarn dev:guardian-ui
     # third guardian
     PORT=3002 REACT_APP_FM_CONFIG_API="ws://127.0.0.1:18185" yarn dev:guardian-ui
     # fourth guardian
     PORT=3003 REACT_APP_FM_CONFIG_API="ws://127.0.0.1:18186" yarn dev:guardian-ui
   ```

1. Run gateway-ui in development environment

   ```bash
      yarn dev:gateway-ui
   ```

1. Run `docker compose down` when done. It might be worth deleting `fm_*`, directory from the repo. These are data directories mounted to Docker containers running fedmintd and are listed in `.gitignore` so are safe to remove. -->

## Referencing Fedimint

The docker containers and devimint are for specific releases or commits of `fedimint/fedimint`. At present, the reference commit-hash is `6da8ff595d1373e24f365d750872bd588fda17c9`

### Running with local Fedimint

If you would like to run the UIs against a particular version of fedimint, or using changes you have made locally to fedimint itself:

1. Run `cargo build` in fedimint
2. Run `env DEVIMINT_BIN=$(realpath ../fedimint/target-nix/debug) yarn nix-guardian` (assuming that you have `ui` and `fedimint` repos checked out in the same directory)

This will put binaries in `fedimint/target-nix/debug` at the front of your `$PATH`. Devimint will use these binaries instead of the ones installed via Nix.

### Bumping referenced Fedimint

You can officially bump the referenced version of Fedimint using the following steps:

1. Locate a desired hash from [Fedimint](https://github.com/fedimint/fedimint/commits/master)
2. Find and replace all instances of the current reference commit hash: `6da8ff595d1373e24f365d750872bd588fda17c9`

3. Run `nix flake update` at the root of the repo
4. Restart your nix shell and validate the reference, then commit to complete bump
