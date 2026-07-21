"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const APP_ROUTES = ["/chat", "/bible", "/search", "/settings", "/login", "/signup", "/forgot-password"];

function isAppRoute(pathname) {
  return APP_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export default function ConditionalChrome({ children }) {
  const pathname = usePathname();

  if (isAppRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
