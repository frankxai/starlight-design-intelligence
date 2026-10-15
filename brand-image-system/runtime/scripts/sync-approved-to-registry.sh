#!/usr/bin/env bash
set -eu
# Verify/register local artifacts. DAM upload and publication require their own adapters.
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$script_dir/../../../scripts/register-media-asset.mjs" "$@"
