import { getParks, dataDir } from "../src/common";
import stringify from "json-stringify-pretty-compact";
import fs from "fs";

(async () => {
  const parks = await getParks();

  await fs.promises.writeFile(
    `${dataDir}/boundaries.json`,
    stringify({
      type: "FeatureCollection",
      features: parks
        .map((park) => park.getBoundaryFeature())
        .filter((boundaryFeature) => !!boundaryFeature),
    })
  );
})();
