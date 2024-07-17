import { BASE_URL } from "../../consts";

export function buildPath(path: string): string {
	return BASE_URL + path;
}
