import fs from "fs";

export const fromCache = (name: string, fetchFn: Function) => {
  const cacheDir = "./cache";
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
            .writeFile(filePath, JSON.stringify(result))
            .then(() => result)
        )
      )
  );
};
