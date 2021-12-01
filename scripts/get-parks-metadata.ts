import { getWikidataNationalParks, WikiNationalPark } from "../src/wikidata";
import { overpassJson, OverpassJson, OverpassRelation } from "overpass-ts";
import { fromCache } from "../src/common";
import osmtogeojson from "osmtogeojson";
import "isomorphic-fetch";
import fs from "fs";

(async () => {
  const wikiParks = (await fromCache("wikiParks", () =>
    getWikidataNationalParks()
  )) as WikiNationalPark[];

  const osmParks = (await fromCache("osmParks", () =>
    overpassJson(
      `[out:json]; rel(id:${wikiParks
        .map((wikiPark) => wikiPark.osmRelationId)
        .join(",")}); out geom;`
    )
  )) as OverpassJson;

  const osmParksGeoJson = osmtogeojson(osmParks);

  const parkFeatureCollection = {
    type: "FeatureCollection",
    features: wikiParks
      .map((wikiPark) => {
        const osmPark = osmParksGeoJson.features.find(
          (feature) => feature.id === `relation/${wikiPark.osmRelationId}`
        );

        if (typeof osmPark === "undefined") return null;
        else
          return {
            type: "Feature",
            properties: {
              // add @ before wikidata properties
              ...Object.assign(
                Object.entries(wikiPark).map(([key, val]) => ({
                  [`@${key}`]: val,
                }))
              ),
              ...osmPark.properties,
            },
            geometry: osmPark.geometry,
          };
      })
      .filter((parkFeature) => parkFeature != null),
  };

  await fs.promises.writeFile(
    "./cache/parkFeatures.json",
    JSON.stringify(parkFeatureCollection)
  );
})();
