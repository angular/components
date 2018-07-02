#!/bin/bash

set -e

find src | grep /tsconfig.*json | grep -v '/tsconfig.json' | while read tsconfig; do
  dir=`dirname $tsconfig`
  echo "Updating $tsconfig"

  # If no index.ts exists, rename public-api.ts.
  if [ ! -f $dir/index.ts -a -f $dir/public-api.ts ]
  then
    echo "export * from './public_api';" > $dir/index.ts
  fi
  node scripts/ivy/fix-tsconfig.js $tsconfig
done