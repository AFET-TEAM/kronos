import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  const url = event.url.pathname;

  if (
    url.includes("/_app/immutable/") ||
    url.match(/\.(woff2|woff|ttf|otf)$/) ||
    url.match(/\/icons\/.*\.svg$/) ||
    url.match(/\/images\/.*\.(webp|png|jpg|jpeg)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (url.endsWith(".html") || url === "/") {
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate"
    );
  }

  return response;
};
