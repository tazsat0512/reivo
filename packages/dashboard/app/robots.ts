import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/sign-in',
          '/sign-up',
          '/overview',
          '/sessions',
          '/agents',
          '/loops',
          '/settings',
          '/billing',
        ],
      },
    ],
    sitemap: 'https://reivo.dev/sitemap.xml',
  };
}
