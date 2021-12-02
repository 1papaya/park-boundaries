import { getParksFeatureCollection, outDir } from "../src/common";
import stringify from "json-stringify-pretty-compact";
import fs from "fs";

(async () => {
  const parksFeatureCollection = await getParksFeatureCollection();

  await fs.promises
    .mkdir(`${outDir}/relation`, { recursive: true })
    .then(() =>
      Promise.all(
        parksFeatureCollection.features.map((parkFeature) =>
          fs.promises.writeFile(
            `${outDir}/relation/${parkFeature.id}.json`,
            stringify(parkFeature)
          )
        )
      )
    );
})();
