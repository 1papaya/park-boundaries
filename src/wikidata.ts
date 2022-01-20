export const nationalParksQuery = `
SELECT DISTINCT
  ?park
  ?parkName
  ?osmRelationId
  ?wikipedia
  ?countryCode
  ?country

WHERE {  
  VALUES ?protection { 
    wd:Q14545608     # IUCN Ia Strict Nature Reserve
    wd:Q14545620     # IUCN Ib Wilderness Area
    wd:Q14545628     # IUCN II National Park
  }

  ?park wdt:P814 ?protection .
        hint:Prior hint:runFirst true .

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
    ?park rdfs:label ?parkName .
  }

  OPTIONAL {
   ?park wdt:P402 ?osmRelationId .
  }
  
  OPTIONAL {
    ?park wdt:P17 ?country_ .
    ?country_ wdt:P297 ?countryCode .
 
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en" .
        ?country_ rdfs:label ?country .
    }
  }

  OPTIONAL {
    VALUES ?langs { "en" }
    ?wikipedia schema:about ?park .
    ?wikipedia schema:inLanguage ?langs .
    FILTER (SUBSTR(str(?wikipedia), 11, 15) = ".wikipedia.org/")
  }
}`;

export interface WikiNationalPark {
  name: string;
  wikidataId: string;
  osmRelationId: string | null;
  country: string | null;
  countryCode: string | null;
  wikipedia: string | null;
}

export const getParksWikidata = (): Promise<WikiNationalPark[]> =>
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
        osmRelationId: record.osmRelationId?.value ?? null,
        countryCode: record.countryCode?.value ?? null,
        country: record.country?.value ?? null,
        wikipedia: record.wikipedia?.value.split("/").pop() ?? null,
      }))
    );
