export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/goals/:path*",
    "/content/:path*",
    "/linkedin/:path*",
    "/progress/:path*",
    "/resources/:path*",
    "/profile/:path*",
  ],
};
