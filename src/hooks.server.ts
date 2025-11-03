import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const { url } = event;
  
  // Public routes - herkes erişebilir
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

  // Client-side auth check için cookie kontrolü
  const token = event.cookies.get('token');
  
  // Public route değilse ve token yoksa login'e yönlendir
  if (!isPublicRoute && !token) {
    return Response.redirect(new URL('/login', url.origin), 302);
  }

  // Login/register'a token varken erişirse dashboard'a yönlendir
  if (isPublicRoute && token && url.pathname !== '/forgot-password' && url.pathname !== '/reset-password') {
    return Response.redirect(new URL('/', url.origin), 302);
  }

  const response = await resolve(event);

  const urlPathname = event.url.pathname;

  if (
    urlPathname.includes("/_app/immutable/") ||
    urlPathname.match(/\.(woff2|woff|ttf|otf)$/) ||
    urlPathname.match(/\/icons\/.*\.svg$/) ||
    urlPathname.match(/\/images\/.*\.(webp|png|jpg|jpeg)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (urlPathname.endsWith(".html") || urlPathname === "/") {
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate"
    );
  }

  return response;
};
