import "./lib/nextauth-url"
import { withAuth } from "next-auth/middleware"

export default withAuth

export const config = {
  matcher: ["/dashboard/:path*", "/todos/:path*", "/goals/:path*", "/calendar/:path*", "/habits/:path*", "/timelogs/:path*", "/pomodoro/:path*", "/diary/:path*", "/journal/:path*", "/notes/:path*", "/mood/:path*", "/reports/:path*", "/settings/:path*"],
}
