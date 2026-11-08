/** Public origin used for canonical URLs, the sitemap and social previews. */
export function siteUrl(): URL {
  return new URL(
    process.env.SITE_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000",
  );
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString();
}
