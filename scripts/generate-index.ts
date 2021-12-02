import { getParksFeatureCollection, outDir } from "../src/common";
import turfBbox from "@turf/bbox";
import fs from "fs";

(async () => {
  const parksIndex = await getParksFeatureCollection().then(
    (parksFeatureCollection) =>
      parksFeatureCollection.features.map((parkFeature) => ({
        name: parkFeature.properties["name"],
        id: parkFeature.id,
        bbox: turfBbox(parkFeature),
      }))
  );

  await fs.promises.writeFile(
    `${outDir}/index.json`,
    JSON.stringify(parksIndex)
  );
})();
