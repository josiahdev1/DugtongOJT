// Options for the sign-in cookie, shared by the server client, the proxy
// and the browser client so they all write it the same way.
//
// `secure` means the browser only sends the cookie over HTTPS, so it can
// never leak over plain HTTP. It is switched on in production only,
// because local development runs on http://localhost.
//
// `httpOnly` is deliberately NOT set: the two file uploaders
// (document-uploader and moa-uploader) run in the browser and need to read
// the session. Making it httpOnly would break uploads.
export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
