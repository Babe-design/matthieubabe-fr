import fs from "node:fs/promises";
import opentype from "opentype.js";

// Both typefaces use the SIL Open Font License; see the adjacent license files.
const source = await fs.readFile("scripts/assets/magnets/quicksand-bold.ttf");
const font = opentype.parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
const bSource = await fs.readFile("scripts/assets/magnets/lilita-one.ttf");
const bFont = opentype.parse(bSource.buffer.slice(bSource.byteOffset, bSource.byteOffset + bSource.byteLength));
const letters = Object.fromEntries([...new Set("Babe")].map(letter => [
  letter,
  (letter === "B" ? bFont : font).getPath(letter, 0, 0, 1).commands.map(command => Object.fromEntries(
    Object.entries(command).map(([key, value]) => [
      key,
      typeof value === "number" ? Number((key.startsWith("y") ? -value : value).toFixed(6)) : value
    ])
  ))
]));
await fs.writeFile("src/assets/magnet-outlines.json", `${JSON.stringify(letters)}\n`);
console.log("Generated magnet outlines: Lilita One B, Quicksand abe.");
