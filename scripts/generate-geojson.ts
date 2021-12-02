import { getParksFeatureCollection, cacheDir } from "../src/common";
import fs from "fs";

(async () => {
  const parksFeatureCollection = await getParksFeatureCollection();

  await fs.promises
    .mkdir(cacheDir, { recursive: true })
    .then(() =>
      fs.promises.writeFile(
        `${cacheDir}/parksFeatureCollection.json`,
        JSON.stringify(parksFeatureCollection, null, 2)
      )
    );
})();
