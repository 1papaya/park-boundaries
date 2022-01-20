import stringify from "json-stringify-pretty-compact";
import { getParksWikidata } from "./wikidata";
import { overpassJson } from "overpass-ts";
import urlSlug from "url-slug";
import { Park } from "./park";
import fs from "fs";

import type { WikiNationalPark } from "./wikidata";
import type { OverpassRelation } from "overpass-ts";

export const dataDir = "./data";
export const outDir = "./docs";

export const slugify = (str: string) => {
  const slug = urlSlug(str);
  return slug == "" ? null : slug;
};

export const getParks = async (): Promise<Park[]> => {
  const parksData = await fromCache("parks", async () => {
    const wikiParks = await getWikiData();
    const osmParks = await getOsmData();

    return wikiParks
      .map((wikiPark) => [
        wikiPark,
        wikiPark.osmRelationId
          ? osmParks.elements.find(
              (feature) => feature.id === parseInt(wikiPark.osmRelationId)
            ) ?? null
          : null,
      ])
      .map(
        ([wikiPark, osmRelation]: [
          WikiNationalPark,
          OverpassRelation | null
        ]) => ({
          wiki: wikiPark,
          osm: osmRelation,
        })
      );
  });

  return parksData.map((parkData) => new Park(parkData));
};

export const getWikiData = () =>
  fromCache("wikidata", () => getParksWikidata());

export const getOsmData = () =>
  getWikiData().then((wikiParks) =>
    fromCache("osm", () =>
      overpassJson(
        `[out:json]; rel(id:${wikiParks
          .filter((wikiPark) => !!wikiPark.osmRelationId)
          .map((wikiPark) => wikiPark.osmRelationId)
          .join(",")}); out geom;`
      )
    )
  );

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
