import type { Location } from "react-router";

export const LOGIN_PATH = "/login";

export const redirectTargetFrom = (location: Location, fallback: string): string => {
  const from = (location.state as { from?: Location } | null)?.from;
  return from && from.pathname !== LOGIN_PATH ? `${from.pathname}${from.search}` : fallback;
};
