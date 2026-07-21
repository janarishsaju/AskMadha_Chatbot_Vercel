export const dynamic = "force-static";

export default function sitemap() {
  const baseUrl = "https://askmadha.app";

  const routes = [
    "",
    "/about",
    "/download",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
