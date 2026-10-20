import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link, redirect, usePathname i useRouter conscients de l'idioma
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
