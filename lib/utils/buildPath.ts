import { BASE_URL } from "../../consts/index.ts";

export function buildPath(path: string): string {
  return BASE_URL + path;
}
