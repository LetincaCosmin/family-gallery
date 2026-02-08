export function slugify(input) {
  return (
    String(input || "")
      .trim()
      .toLowerCase()
      // diacritice RO
      .replace(/ă/g, "a")
      .replace(/â/g, "a")
      .replace(/î/g, "i")
      .replace(/ș/g, "s")
      .replace(/ş/g, "s")
      .replace(/ț/g, "t")
      .replace(/ţ/g, "t")
      // rest
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}
