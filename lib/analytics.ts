/**
 * Cloudflare Web Analytics site token (Cloudflare dashboard → Analytics & Logs → Web Analytics).
 * The token is public by design: it ships in the page's HTML. Null disables the beacon.
 * Cookie-free and without personal data, so no consent banner is needed.
 */
export const CLOUDFLARE_ANALYTICS_TOKEN: string | null = null;
