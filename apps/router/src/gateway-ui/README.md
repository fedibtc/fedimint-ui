# Gateway UI

Web app experience for managing Fedimint gateways. This is used by Gateway administrators

## Development

### Environment setup

From repo root directory:

1. Install dependencies if necessary: `yarn install`
1. Run `docker-compose up` to start a gateway along with two federations. You can [learn more about this command here](../../README.md#development)

### Run Gateway Admin UI

1. Confirm you are in `gateway-ui/` app directory
1. Run `VITE_FM_GATEWAY_API="http://127.0.0.1:8175" VITE_FM_GATEWAY_PASSWORD="theresnosecondbest" yarn dev`

> This will show you a running Gateway UI connected to a gateway.

You can connect a federation to this gateway from the UI.

> Run through the [process of setting up a federation](../guardian-ui/README.md#set-up-your-federation) to get connection string for linking your gateway to the federation
