import { getParksFeatureCollection, cacheDir } from "../src/common";
import stringify from "json-stringify-pretty-compact";
import polylabel from "@mapbox/polylabel";
import turfArea from "@turf/area";
import fs from "fs";

const roundedPolylabel = (coords) =>
  polylabel(coords).map((coord) => Math.round(coord * 10e6) / 10e6);

function getLabelPoint(
  feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
): GeoJSON.Point {
  if (feature.geometry.type === "Polygon")
    return {
      type: "Point",
      coordinates: roundedPolylabel(feature.geometry.coordinates),
    };

  let maxArea = 0;
  let maxPolygonCoords = [];

  for (let polygonCoords of feature.geometry.coordinates) {
    const polygonArea = turfArea({
      type: "Polygon",
      coordinates: polygonCoords,
    });

    if (polygonArea > maxArea) {
      maxPolygonCoords = polygonCoords;
      maxArea = polygonArea;
    }
  }
  return { type: "Point", coordinates: roundedPolylabel(maxPolygonCoords) };
}

(async () => {
  const parksFeatureCollection = await getParksFeatureCollection();

  await fs.promises.writeFile(
    `${cacheDir}/label-points.json`,
    stringify({
      type: "FeatureCollection",
      features: parksFeatureCollection.features.map((parkFeature) => ({
        ...parkFeature,
        properties: {
          name: parkFeature.properties["name"],
        },
        geometry: getLabelPoint(
          parkFeature as GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>
        ),
      })),
    })
  );
})();
