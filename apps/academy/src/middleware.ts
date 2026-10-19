import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Totes les rutes excepte API, fitxers interns de Next i fitxers estàtics
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
