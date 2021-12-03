# ./bin/tippecanoe --drop-densest-as-needed \
#                  --force \
#                  --drop-rate=1 \
#                  --minimum-zoom=1 \
#                  --maximum-zoom=11 \
#                  --no-tile-compression \
#                  --output="./data/parks.mbtiles" \
#                  ./data/boundaries.json \
#                  ./data/points.json
                 
./bin/tippecanoe --drop-densest-as-needed \
                 --force \
                 --drop-rate=1 \
                 --minimum-zoom=1 \
                 --maximum-zoom=11 \
                 --no-tile-compression \
                 --output-to-directory="./docs/" \
                 ./data/boundaries.json \
                 ./data/points.json
