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

For more advanced options and to learn how to spin up a Fedimint developer environment see here https://github.com/fedimint/fedimint/blob/master/HACKING.md and https://github.com/fedimint/fedimint/blob/master/docs/tutorial.md.

In addition, see the [Nix Setup](docs/nix.md) guide for a step-by-step process to run the fedimint-ui development environment using Nix.

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
