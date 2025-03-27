{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    # v0.5.0-rc.1
    fedimint.url =
      "github:fedimint/fedimint?rev=6da8ff595d1373e24f365d750872bd588fda17c9";
  };
  outputs = { self, flake-utils, fedimint }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        nixpkgs = fedimint.inputs.nixpkgs;
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ fedimint.overlays.all ];
        };

        # When `yarn.lock` changes, follow these steps to update the `sha256` hash:
        # 1. Remove the existing `sha256` hash.
        # 2. Rebuild the Nix derivation by executing:
        #    nix build .#guardian-ui
        # 3. Obtain the new `sha256` hash from the build error message.
        # 4. Update the `sha256` value below with the newly copied hash.
        #
        # **Important:** 
        # Keeping the `sha256` hash in sync with `yarn.lock` is essential. An outdated or incorrect hash 
        # will cause the Nix package to become out-of-sync with Yarn dependencies, potentially leading 
        # to build failures or inconsistent behavior.
        yarnOfflineCache = pkgs.fetchYarnDeps {
          yarnLock = ./yarn.lock;
          hash = "sha256-a1YeZYvxstAqDCgK2qrlylkKYhIX1Xo28tCKt46hxrE=";
        };
      in
      {
        devShells =  {
          default = pkgs.mkShell {
            nativeBuildInputs = [
              pkgs.mprocs
              pkgs.nodejs
              pkgs.yarn
              pkgs.bitcoind
              pkgs.electrs
              pkgs.jq
              pkgs.lnd
              pkgs.netcat
              pkgs.perl
              pkgs.esplora-electrs
              pkgs.procps
              pkgs.which
              fedimint.packages.${system}.devimint
              fedimint.packages.${system}.gateway-pkgs
              fedimint.packages.${system}.fedimint-pkgs
            ];
            shellHook = ''
              yarn install
            '';
          };
        };

        # Used for a releasable build artifact 
        packages.guardian-ui = pkgs.stdenv.mkDerivation {
          pname = "guardian-ui";
          version = "0.4.3";
          src = ./.;

          nativeBuildInputs = with pkgs; [
            nodejs
            yarn
            cacert
            yarn2nix-moretea.fixup_yarn_lock
            nodePackages.serve
          ];

          configurePhase = ''
            export HOME=$(mktemp -d)
          '';

          # NixOS is introducing `yarnBuildHook`, `yarnConfigHook`, and `yarnInstallHook`,
          # which could simplify the current complex `buildPhase` that uses `fixup_yarn_lock`
          # and the `installPhase`.
          # 1. [JavaScript Frameworks Documentation](https://github.com/NixOS/nixpkgs/blob/ab4dc6ca78809a367aba6fb2813a15116560e2a9/doc/languages-frameworks/javascript.section.md)
          # 2. [Nixpkgs Issue #324246](https://github.com/NixOS/nixpkgs/issues/324246)
          #
          # Additionally, avoid using `pkgs.mkYarnPackage` as it is slated for deprecation.

          buildPhase = ''
            yarn config --offline set yarn-offline-mirror ${yarnOfflineCache}
            fixup_yarn_lock yarn.lock

            yarn install --offline \
              --frozen-lockfile \
              --ignore-engines --ignore-scripts
            patchShebangs .

            yarn build
          '';

          # should be similar to the installer in the Dockerfile
          installPhase = ''
            mkdir -p $out
            # static files that can be served by reverse-proxies
            cp -r apps/router/build/* $out

            # wrapper for "nix run .#guardian-ui" (based on https://wiki.nixos.org/wiki/Node.js#Packaging_with_yarn2nix)
            mkdir -p $out/bin
            echo "#!/bin/sh" > $out/bin/guardian-ui
            echo "exec ${pkgs.nodePackages.serve}/bin/serve -s $out" >> $out/bin/guardian-ui
            chmod +x $out/bin/guardian-ui
          '';
        };
      });
}
