import { getParksFeatureCollection, outDir } from "../src/common";
import fs from "fs";

(async () => {
  const parksIndex = await getParksFeatureCollection().then(
    (parksFeatureCollection) =>
      parksFeatureCollection.features.map((parkFeature) => ({
        name: parkFeature.properties["name"],
        id: parkFeature.properties["id"].split("/")[1],
      }))
  );

  await fs.promises.writeFile(
    `${outDir}/index.json`,
    JSON.stringify(parksIndex)
  );
})();
