import { getParks, outDir } from "../src/common";
import fs from "fs";

(async () => {
  const parks = await getParks();

  await fs.promises.writeFile(
    `${outDir}/index.json`,
    JSON.stringify(
      parks
        .map((park) => park.getIndexFeature())
        .filter((indexFeature) => !!indexFeature)
    )
  );
})();
