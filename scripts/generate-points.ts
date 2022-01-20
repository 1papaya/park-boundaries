import stringify from "json-stringify-pretty-compact";
import { getParks, dataDir } from "../src/common";
import fs from "fs";

(async () => {
  const parks = await getParks();

  await fs.promises.writeFile(
    `${dataDir}/points.json`,
    stringify({
      type: "FeatureCollection",
      features: parks
        .map((park) => park.getPointFeature())
        .filter((pointFeature) => !!pointFeature),
    })
  );
})();
