import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top whenever the route pathname changes.
 * This ensures every page navigation lands at the hero section, not
 * at whatever scroll position the previous page was at.
 *
 * Place once inside <BrowserRouter>, before <Routes>.
 */
export function RouteScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
