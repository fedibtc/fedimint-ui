# shellcheck shell=bash
set -eo pipefail

validate_port() {
  if ! [[ "$1" =~ ^[0-9]+$ ]] || [ "$1" -lt 1 ] || [ "$1" -gt 65535 ]; then
    echo "Invalid port number."
    exit 1
  fi
}

# Check if a port number was provided as an argument
if [ $# -eq 1 ]; then
  read -p "Port $1 provided as argument. Press Enter to use this port or enter a different port: " input_port
  if [[ -z "$input_port" ]]; then
    CONFIG_PORT="$1"
  else
    CONFIG_PORT="$input_port"
  fi
else
  # Prompt user for config port if no valid argument was provided
  read -p "Enter the config port for the fedimintd to point at: " CONFIG_PORT
fi

# Validate the provided or entered port
validate_port "$CONFIG_PORT"

# Export the environment variable
export VITE_FM_CONFIG_API="ws://127.0.0.1:$CONFIG_PORT"

# Start the guardian UI
yarn dev:guardian-ui
