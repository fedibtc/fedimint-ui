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

# Check if argument is provided
if [ -z "$GATEWAY_TYPE" ]; then
    echo "Error: GATEWAY_TYPE is required for gateway-ui dev. Use 'cln', 'lnd', or 'ldk'."
    exit 1
fi

# Configure UI env from devimint env
LOCAL_GATEWAY_API_ADDR=$FM_GATEWAY_API_ADDR

# Handle which gateway to connect to
if [ "$GATEWAY_TYPE" = "cln" ]; then
    LOCAL_GATEWAY_API_ADDR="$FM_GATEWAY_API_ADDR"
elif [ "$GATEWAY_TYPE" = "lnd" ]; then
    LOCAL_GATEWAY_API_ADDR=$(echo "$FM_GATEWAY_API_ADDR" | sed -E 's/:([0-9]+)$/:'"$(($(echo "$FM_GATEWAY_API_ADDR" | sed -E 's/.*:([0-9]+)$/\1/') + 1))"'/')
elif [ "$GATEWAY_TYPE" = "ldk" ]; then
    LOCAL_GATEWAY_API_ADDR=$(echo "$FM_GATEWAY_API_ADDR" | sed -E 's/:([0-9]+)$/:'"$(($(echo "$FM_GATEWAY_API_ADDR" | sed -E 's/.*:([0-9]+)$/\1/') + 2))"'/')
else
    echo "Error: Invalid gateway type. Use 'cln', 'lnd', or 'ldk'."
    exit 1
fi

echo "Starting gateway-ui on $LOCAL_GATEWAY_API_ADDR"
echo "Gateway type: $GATEWAY_TYPE"
echo "Local gateway api addr: $LOCAL_GATEWAY_API_ADDR"

export VITE_FM_GATEWAY_API=$LOCAL_GATEWAY_API_ADDR
export VITE_FM_GATEWAY_PASSWORD=$FM_GATEWAY_PASSWORD

yarn dev
