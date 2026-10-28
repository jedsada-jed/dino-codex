/**
 * Cloudflare Web Analytics site token, for hosts where Cloudflare can't inject the beacon itself.
 * dinocodex.com uses Web Analytics "Automatic setup", so Cloudflare adds the beacon at the edge
 * and this stays null to avoid counting every page view twice. The token is public by design
 * (it ships in the page's HTML). Cookie-free and without personal data: no consent banner needed.
 */
export const CLOUDFLARE_ANALYTICS_TOKEN: string | null = null;
