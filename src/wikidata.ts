export const nationalParksQuery = `
SELECT DISTINCT
?park
?parkName
?osmRelationId
?wikipedia
?country

WHERE {  
VALUES ?protection { 
  wd:Q14545608     # IUCN Ia Strict Nature Reserve
  wd:Q14545620     # IUCN Ib Wilderness Area
  wd:Q14545628     # IUCN II National Park
}

?park wdt:P814 ?protection .
      hint:Prior hint:runFirst true .

?park wdt:P402 ?osmRelationId .

SERVICE wikibase:label {
  bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
  ?park rdfs:label ?parkName .
}

OPTIONAL {
  ?park wdt:P17 ?country_ .
  SERVICE wikibase:label {
      bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" .
      ?country_ rdfs:label ?country .
    }
}

OPTIONAL {
  VALUES ?langs { "[AUTO_LANGUAGE]" "en" }
  ?wikipedia schema:about ?park .
  ?wikipedia schema:inLanguage ?langs .
  FILTER (SUBSTR(str(?wikipedia), 11, 15) = ".wikipedia.org/")
}
}`;

export interface WikiNationalPark {
  name: string;
  wikidataId: string;
  osmRelationId: string;
  country: string | null;
  wikipedia: string | null;
}

export const getWikidataNationalParks = (): Promise<WikiNationalPark[]> =>
  fetch(
    `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
      nationalParksQuery
    )}`,
    { cache: "no-cache" }
  )
    .then((resp) => resp.json())
    .then((wikidataJson: any) =>
      wikidataJson.results.bindings.map((record) => ({
        name: record.parkName.value,
        wikidataId: record.park.value.split("/").pop(),
        osmRelationId: record.osmRelationId.value,
        country: "country" in record ? record.country.value : null,
        wikipedia:
          "wikipedia" in record
            ? record.wikipedia.value.split("/").pop()
            : null,
      }))
    );
