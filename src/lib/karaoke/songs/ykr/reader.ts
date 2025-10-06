import pako from "pako";
import { Project } from "./types";

export async function readYkrFile(file: File) {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const jsonString = pako.ungzip(uint8, { to: "string" });
  return JSON.parse(jsonString) as Project;
}
