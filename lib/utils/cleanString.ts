export function cleanString(string: string | undefined): string | undefined {
  if (!string) {
    return string;
  }
  const dirtyString = string.replaceAll('<font class="sml">', "").replaceAll(
    "</font>",
    "",
  ).replaceAll(" » ", " | ").replaceAll("<b>", "").replaceAll("</b>", "")
    .replaceAll("\t", "").replaceAll("\n", "").split("&lt;");
  if (dirtyString.length === 1) {
    return dirtyString[0];
  }

  dirtyString[0] = dirtyString[0].split(" | ")[0] + " | ";
  return dirtyString.join("").replaceAll("&gt;", "");
}
