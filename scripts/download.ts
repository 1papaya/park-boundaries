import { getParksFeatureCollection, dataDir } from "../src/common";
import fs from "fs";

(async () => {
  const featureCollectionPath = `${dataDir}/feature-collection.json`;

  await fs.promises
    .access(featureCollectionPath)
    .then(() =>
      fs.promises
        .unlink(featureCollectionPath)
        .then(() => getParksFeatureCollection())
    )
    .catch(() => getParksFeatureCollection());
})();
