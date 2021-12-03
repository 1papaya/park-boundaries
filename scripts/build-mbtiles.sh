./bin/tippecanoe --drop-densest-as-needed \
                 --force \
                 --minimum-zoom=1 \
                 --maximum-zoom=11 \
                 --no-tile-compression \
                 --output-to-directory="./docs/" \
                 ./data/boundaries.json \
                 ./data/points.json