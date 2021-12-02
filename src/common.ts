import { getWikidataNationalParks, WikiNationalPark } from "../src/wikidata";
import { overpassJson, OverpassJson } from "overpass-ts";
import osmtogeojson from "osmtogeojson";
import fs from "fs";

export const cacheDir = "./cache";
export const outDir = "./docs";

export const getParksFeatureCollection = async () => {
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

  return {
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
            id: parseInt(wikiPark.osmRelationId),
            properties:
              // add @ before wikidata properties
              Object.assign(
                {},
                ...Object.entries(wikiPark).map(([key, val]) => ({
                  [`@${key}`]: val,
                })),
                osmPark.properties
              ),
            geometry: osmPark.geometry,
          };
      })
      .filter((parkFeature) => parkFeature != null),
  };
};

export const fromCache = (name: string, fetchFn: Function) => {
  const filePath = `${cacheDir}/${name}.json`;

  return fs.promises.mkdir(cacheDir, { recursive: true }).then(() =>
    fs.promises
      .access(filePath)
      .then(() =>
        fs.promises
          .readFile(filePath, { encoding: "utf8" })
          .then((txt) => JSON.parse(txt))
      )
      .catch(() =>
        fetchFn().then((result) =>
          fs.promises
            .writeFile(filePath, JSON.stringify(result, null, 2))
            .then(() => result)
        )
      )
  );
};
