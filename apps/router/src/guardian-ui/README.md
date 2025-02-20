# Guardian UI

Web app experience for setting up and administering fedimints. This is used by the Fedimint guardians

## Development

### Environment setup

From repo root directory:

1. Install dependencies if necessary: `yarn install`
1. Run `docker-compose up` to start two fedimint servers, a gateway, and other dependencies.

You can [learn more about this command here](../../README.md#development)

### Run Federation Setup UIs

Do the following in separate terminals:

- **First Terminal**

1. Confirm you are in `guardian-ui/` directory
1. Run `PORT=3000 VITE_FM_CONFIG_API="ws://127.0.0.1:18174" yarn dev`
   - This will be your "Leader" instance

- **Second Terminal**

1. Confirm you are in `guardian-ui/` directory
1. Run `PORT=3001 VITE_FM_CONFIG_API="ws://127.0.0.1:18184" yarn dev`
   - This will be your first "Follower" instance

- **Third Terminal**

1. Confirm you are in `guardian-ui/` directory
1. Run `PORT=3002 VITE_FM_CONFIG_API="ws://127.0.0.1:18185" yarn dev`
   - This will be your second "Follower" instance

- **Fourth Terminal**

1. Confirm you are in `guardian-ui/` directory
1. Run `PORT=3003 VITE_FM_CONFIG_API="ws://127.0.0.1:18186" yarn dev`
   - This will be your third "Follower" instance

### Set up your federation

Use these UIs to set up your two-guardian federation
