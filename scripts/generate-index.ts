import { getParksFeatureCollection, outDir, slugify } from "../src/common";
import turfBbox from "@turf/bbox";
import fs from "fs";

(async () => {
  const parksIndex = await getParksFeatureCollection().then(
    (parksFeatureCollection) =>
      parksFeatureCollection.features.map((parkFeature) => ({
        name: parkFeature.properties.osm["name"],
        slug: `${slugify(parkFeature.properties.wiki.country)}/${slugify(
          parkFeature.properties.wiki.name
        )}`,
        wikidataId: parkFeature.properties.wiki.wikidataId,
        osmRelationId: parkFeature.id,
        bbox: turfBbox(parkFeature),
      }))
  );

  await fs.promises.writeFile(
    `${outDir}/index.json`,
    JSON.stringify(parksIndex)
  );
})();
