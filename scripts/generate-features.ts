import { getParks, outDir } from "../src/common";
import fs from "fs";
import stringify from "json-stringify-pretty-compact";

(async () => {
  const parks = await getParks();

  return fs.promises.mkdir(`${outDir}/relation`, { recursive: true }).then(() =>
    Promise.all(
      parks
        .map((park) => park.getBoundaryFeature(true))
        .filter((boundaryFeature) => !!boundaryFeature)
        .map((boundaryFeature) =>
          fs.promises.writeFile(
            `${outDir}/relation/${boundaryFeature.id}.json`,
            stringify(boundaryFeature)
          )
        )
    )
  );
})();
