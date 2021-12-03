import { getParksFeatureCollection, dataDir } from "../src/common";
import stringify from "json-stringify-pretty-compact";
import fs from "fs";

(async () => {
  const parksFeatureCollection = await getParksFeatureCollection();

  await fs.promises.writeFile(
    `${dataDir}/boundaries.json`,
    stringify({
      type: "FeatureCollection",
      features: parksFeatureCollection.features.map((feat) => ({
        ...feat,
        properties: {
          name: feat.properties.osm["name"],
        },
      })),
    })
  );
})();
