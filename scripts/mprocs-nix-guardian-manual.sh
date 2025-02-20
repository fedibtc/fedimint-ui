# shellcheck shell=bash

set -eo pipefail

eval "$(devimint env)"

echo Waiting for devimint to start up fedimint and gateway

STATUS="$(devimint wait)"
if [ "$STATUS" = "ERROR" ]; then
  echo "fedimint didn't start correctly"
  echo "See other panes for errors"
  exit 1
fi

# Prompt user for config port
read -p "Enter the config port for the fedimintd to point at: " CONFIG_PORT
if ! [[ "$CONFIG_PORT" =~ ^[0-9]+$ ]] || [ "$CONFIG_PORT" -lt 1 ] || [ "$CONFIG_PORT" -gt 65535 ]; then
  echo "Invalid port number."
  exit 1
fi

# Export the environment variable
export VITE_FM_CONFIG_API="ws://127.0.0.1:$CONFIG_PORT"

# Start the guardian UI
yarn dev
