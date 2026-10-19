import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Tot menys API, fitxers interns de Next i fitxers estàtics (amb punt)
  matcher: "/((?!api|_next|_vercel|opengraph-image|.*\\..*).*)",
};
