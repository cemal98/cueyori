const defaultSessionTitles = new Set([
  "Cooking Session",
  "Pişirme Oturumu",
  "Dinner Coordination",
  "Untitled Cooking Session",
]);

export const getSessionDisplayTitle = (
  title: string,
  localizedDefaultTitle: string,
): string =>
  defaultSessionTitles.has(title.trim()) ? localizedDefaultTitle : title;
