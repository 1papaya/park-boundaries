import { getWikidataNationalParks, WikiNationalPark } from "../src/wikidata";
import { overpassJson, OverpassJson } from "overpass-ts";
import stringify from "json-stringify-pretty-compact";
import osmtogeojson from "osmtogeojson";
import turfArea from "@turf/area";
import urlSlug from "url-slug";
import fs from "fs";

export const dataDir = "./data";
export const outDir = "./docs";

export const slugify = (str: string) => urlSlug(str);

export const getParksFeatureCollection = () => {
  return fromCache("feature-collection", async () => {
    const wikiParks = await fromCache("parks-wiki", () =>
      getWikidataNationalParks()
    );

    const osmParks = await fromCache("parks-osm", () =>
      overpassJson(
        `[out:json]; rel(id:${wikiParks
          .map((wikiPark) => wikiPark.osmRelationId)
          .join(",")}); out geom;`
      )
    );

    return {
      type: "FeatureCollection",
      features: wikiParks
        .map((wikiPark) => {
          try {
            const osmPark = osmParks.elements.find(
              (feature) => feature.id === parseInt(wikiPark.osmRelationId)
            );

            const osmParkFeature = osmtogeojson({ elements: [osmPark] })
              .features[0];

            return {
              type: "Feature",
              id: parseInt(wikiPark.osmRelationId),
              properties: {
                area:
                  Math.round(
                    turfArea({
                      type: "Feature",
                      properties: {},
                      geometry: osmParkFeature.geometry,
                    }) * 1e-4
                  ) / 100,
                osm: osmPark.tags,
                wiki: wikiPark,
              },
              geometry: osmParkFeature.geometry,
            };
          } catch (e) {
            return null;
          }
        })
        .filter(
          (parkFeature) =>
            parkFeature != null &&
            ["Polygon", "MultiPolygon"].includes(parkFeature.geometry.type)
        ),
    };
  });
};

export function fromCache<Output>(
  name: string,
  fetchFn: () => Promise<Output>
): Promise<Output> {
  const filePath = `${dataDir}/${name}.json`;

  return fs.promises.mkdir(dataDir, { recursive: true }).then(() =>
    fs.promises
      .access(filePath)
      .then(() =>
        fs.promises
          .readFile(filePath, { encoding: "utf8" })
          .then((txt) => JSON.parse(txt))
      )
      .catch(() =>
        fetchFn().then((result) =>
          fs.promises.writeFile(filePath, stringify(result)).then(() => result)
        )
      )
  );
}
