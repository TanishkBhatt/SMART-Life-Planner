// Auto-detect NEXTAUTH_URL for production deployments (Vercel, Railway, etc.)
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
  } else if (process.env.RENDER_EXTERNAL_URL) {
    process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL
  } else {
    process.env.NEXTAUTH_URL = "http://localhost:3000"
  }
}

import { withAuth } from "next-auth/middleware"

export const proxy = withAuth

export const config = {
  matcher: ["/dashboard/:path*", "/todos/:path*", "/goals/:path*", "/calendar/:path*", "/habits/:path*", "/timelogs/:path*", "/pomodoro/:path*", "/diary/:path*", "/journal/:path*", "/notes/:path*", "/mood/:path*", "/reports/:path*"],
}
