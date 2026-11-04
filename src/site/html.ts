const entities: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

/** Escapes text that is interpolated into an HTML template. */
export const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (character) => entities[character] ?? character);

export const svgArrow = '<span aria-hidden="true">↗</span>';
