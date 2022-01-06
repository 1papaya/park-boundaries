import pLimit from "p-limit";
import "isomorphic-fetch";

export const getPolygons = (ids: number[], limit = 4) => {
  const limiter = pLimit(limit);

  return Promise.all(
    ids.map((id) =>
      limiter(() =>
        getPolygon(id)
          .then((geom) => ({ [id]: geom }))
          .catch((e) => null)
      )
    )
  ).then((idObjs) => Object.assign({}, ...idObjs));
};

export const getPolygon = (id: number, created = false) =>
  fetch(`http://polygons.openstreetmap.fr/get_geojson.py?id=${id}&params=0`)
    .then((resp) => resp.text())
    .then((text) => {
      try {
        const geomCollection = JSON.parse(text);
        return geomCollection.geometries[0];
      } catch (e) {
        if (created) throw new Error(`error getting polygon ${id}`);
        else
          return fetch(`http://polygons.openstreetmap.fr/?id=${id}`)
            .then((resp) => resp.text())
            .then(() => getPolygon(id, true));
      }
    });
