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
