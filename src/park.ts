import { WikiNationalPark } from "./wikidata";
import { overpassJson, OverpassRelation } from "overpass-ts";
import polylabel from "@mapbox/polylabel";
import osmtogeojson from "osmtogeojson";
import turfArea from "@turf/area";
import turfBbox from "@turf/bbox";
import { slugify } from "./common";
import { rawListeners } from "process";

export interface ParkData {
  wiki: WikiNationalPark;
  osm: OverpassRelation | null;
}
export type ParkBoundary = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export interface ParkIndex {
  name: string;
  slug: string;
  wikidataId: string;
  osmRelationId: number;
  bbox: number[];
}

export class Park {
  wiki: WikiNationalPark;
  osm: OverpassRelation | null;

  constructor(data: ParkData) {
    this.wiki = data.wiki;
    this.osm = data.osm;
  }

  getBoundaryGeometry(): ParkBoundary | null {
    return this.osm
      ? (osmtogeojson({
          elements: [this.osm],
        }).features?.filter((feat) =>
          ["Polygon", "MultiPolygon"].includes(feat.geometry.type)
        )?.[0]?.geometry as ParkBoundary) ?? null
      : null;
  }

  getBoundaryFeature(
    properties: "index" | "osm" = "index"
  ): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, any> | null {
    const boundaryGeom = this.getBoundaryGeometry();

    return this.osm && boundaryGeom
      ? {
          type: "Feature",
          id: this.id,
          properties:
            properties == "osm" ? this.osm.tags : this.getIndexFeature(),
          geometry: boundaryGeom,
        }
      : null;
  }

  getIndexFeature(): ParkIndex | null {
    return this.osm
      ? {
          name: this.name,
          wikidataId: this.wiki.wikidataId,
          osmRelationId: this.osm.id,
          slug: this.slug,
          bbox: this.getBbox(),
        }
      : null;
  }

  getBbox(): number[] {
    const boundaryGeom = this.getBoundaryGeometry();

    return boundaryGeom ? turfBbox(boundaryGeom) : null;
  }

  getPointFeature(): GeoJSON.Feature<GeoJSON.Point> | null {
    let boundaryGeom = this.getBoundaryGeometry();
    let pointCoords = null;

    if (boundaryGeom == null) return null;

    if (boundaryGeom.type == "Polygon")
      pointCoords = this._roundedPolylabel(boundaryGeom.coordinates);
    else {
      // if boundary is multipolygon select the polygon with biggest area
      // to use for point coord calculation
      let maxArea = 0;
      let maxPolygonCoords = [];

      for (let polygonCoords of boundaryGeom.coordinates) {
        const polygonArea = turfArea({
          type: "Polygon",
          coordinates: polygonCoords,
        });

        if (polygonArea > maxArea) {
          maxPolygonCoords = polygonCoords;
          maxArea = polygonArea;
        }
      }

      pointCoords = this._roundedPolylabel(maxPolygonCoords);
    }

    return {
      type: "Feature",
      id: this.id,
      properties: {
        name: this.name,
        slug: this.slug,
      },
      geometry: {
        type: "Point",
        coordinates: pointCoords,
      },
    };
  }

  _roundedPolylabel(coords: GeoJSON.Position[][]) {
    return polylabel(coords).map((coord) => Math.round(coord * 10e6) / 10e6);
  }

  get data(): ParkData {
    return {
      wiki: this.wiki,
      osm: this.osm,
    };
  }

  get name(): string {
    return this.osm?.tags?.["name"] ?? this.wiki.name;
  }

  get id(): number | null {
    return this.osm?.id ?? null;
  }

  get slug(): string {
    // use osm name for slug as default but if returns null (ie its name has
    // non-url-safe chars) then use wikidata name slug

    const osmNameSlug = slugify(this.osm?.tags?.["name"] ?? "");
    const wikiNameSlug = slugify(this.wiki.name);

    return [
      this.wiki.countryCode.toLowerCase(),
      osmNameSlug ? osmNameSlug : wikiNameSlug,
    ].join("/");
  }
}
