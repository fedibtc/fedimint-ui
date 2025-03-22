# Nix Setup

Here's the step-by-step process to run the fedimint-ui development environment using Nix. This is the recommended way to develop on the fedimint-ui if you don't already have fedimint infrastructure set up.

1. Install Nix (if you haven't already)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
   ```
2. In your terminal, `cd` to the fedimint-ui repo root directory
3. Enter the following command to start Nix development environment
   ```bash
   nix develop
   ```
4. Run `yarn nix-guardian` or `yarn nix-gateway`

> Note: **nix-gateway** preconfigures the federation so you don't have to go through federation setup. **nix-guardian** starts separate guardian nodes that are connected into the federation when you run through the federation setup process.
