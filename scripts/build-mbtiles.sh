./bin/tippecanoe --drop-densest-as-needed \
                 --force \
                 --minimum-zoom=1 \
                 --maximum-zoom=11 \
                 --no-tile-compression \
                 --output-to-directory="./docs/" \
                 --layer="park-boundaries" \
                 ./cache/parkFeatures.json