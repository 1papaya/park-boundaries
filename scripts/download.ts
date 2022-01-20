import { getParks, dataDir } from "../src/common";
import fs from "fs";

(async () => {
  const dataPath = `${dataDir}/parks.json`;

  await fs.promises
    .access(dataPath)
    .then(() => fs.promises.unlink(dataPath).then(() => getParks()))
    .catch(() => getParks());
})();
