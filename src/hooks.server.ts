export const handle = async ({ event, resolve }) => {
  // Chrome DevTools'un otomatik isteğini yakala ve boş response dön
  if (event.url.pathname.startsWith("/.well-known")) {
    return new Response("", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  // Diğer tüm istekleri normal şekilde devam ettir
  return resolve(event);
};