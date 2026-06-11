export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().replace(/[^\w]/g, "");
}

export function tokenizeSearchQuery(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .map((term) => normalizeSearchTerm(term))
    .filter((term) => term.length >= 2);
}

/**
 * Builds a flexible regex for a single search term.
 * Handles simple plurals so "shoe" matches "shoes" and vice versa.
 */
export function buildSearchTermRegex(term: string): string {
  const word = normalizeSearchTerm(term);
  if (!word) return "";

  let root = word;

  if (word.endsWith("ies") && word.length > 4) {
    root = `${word.slice(0, -3)}y`;
  } else if (word.endsWith("es") && word.length > 3) {
    root = word.slice(0, -2);
  } else if (word.endsWith("s") && word.length > 2) {
    root = word.slice(0, -1);
  }

  const rootEscaped = escapeRegex(root);
  return `${rootEscaped}(?:s|es|ies)?`;
}

export function buildSearchNameConditions(terms: string[]) {
  return terms.map((term) => ({
    name: {
      $regex: buildSearchTermRegex(term),
      $options: "i",
    },
  }));
}
