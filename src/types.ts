import type { OverpassRelation } from "overpass-ts";
import type { WikiNationalPark } from "src/wikidata";

export interface Park {
  osm: OverpassRelation;
  wikidata: WikiNationalPark;
}
