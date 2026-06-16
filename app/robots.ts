import type { MetadataRoute } from 'next';

/**
 * Privacy is enforced by auth (`middleware.ts`), not robots: every route
 * except /login redirects crawlers to the sign-in page, so protected content
 * is unreachable regardless of policy. We therefore ship a *valid, permissive*
 * robots.txt — it satisfies Lighthouse's `robots-txt` (parseable) and
 * `is-crawlable` (not blocked) SEO audits, where the prior redirect-to-/login
 * failed both. The route is exempted from auth in `middleware.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
