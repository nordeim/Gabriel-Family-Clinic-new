/**
 * Sitemap Generation Utilities for Gabriel Family Clinic
 * 
 * Generates XML sitemaps for:
 * - Main pages (home, about, contact)
 * - Services pages (medical services)
 * - Doctors pages (physician profiles)
 * - Locations pages (clinic locations)
 * - Blog/health articles
 * 
 * Optimized for Singapore healthcare SEO and elderly accessibility
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate main static pages sitemap
 */
export function getStaticPages(): SitemapUrl[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  const currentDate = new Date().toISOString();

  return [
    {
      loc: `${baseUrl}`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/services`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/doctors`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/appointments`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/patient`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.7,
    },
  ];
}

/**
 * Generate services sitemap with CHAS-approved medical services
 */
export function getServicePages(): SitemapUrl[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  const currentDate = new Date().toISOString();

  const services = [
    'general-consultation',
    'chronic-disease-management',
    'health-screening',
    'vaccination',
    'elderly-care',
    'minor-procedures',
    'health-counseling',
    'chas-subsidized-care',
    'diabetes-management',
    'hypertension-care',
    'cholesterol-management',
    'preventive-health',
  ];

  return services.map(service => ({
    loc: `${baseUrl}/services/${service}`,
    lastmod: currentDate,
    changefreq: 'monthly' as const,
    priority: 0.8,
  }));
}

/**
 * Generate doctor profile pages sitemap
 */
export function getDoctorPages(): SitemapUrl[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  const currentDate = new Date().toISOString();

  // In production, fetch from database
  // For now, use static doctor profiles
  const doctors = [
    'dr-sarah-tan',
    'dr-michael-wong',
    'dr-priya-sharma',
  ];

  return doctors.map(doctor => ({
    loc: `${baseUrl}/doctors/${doctor}`,
    lastmod: currentDate,
    changefreq: 'monthly' as const,
    priority: 0.7,
  }));
}

/**
 * Generate location/branch pages sitemap
 */
export function getLocationPages(): SitemapUrl[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  const currentDate = new Date().toISOString();

  const locations = [
    'bedok',
    'tampines',
    'jurong-west',
  ];

  return locations.map(location => ({
    loc: `${baseUrl}/locations/${location}`,
    lastmod: currentDate,
    changefreq: 'monthly' as const,
    priority: 0.6,
  }));
}

/**
 * Generate health articles/blog sitemap
 */
export function getHealthArticles(): SitemapUrl[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  const currentDate = new Date().toISOString();

  // In production, fetch from CMS or database
  const articles = [
    'managing-diabetes-elderly',
    'chas-subsidy-guide',
    'hypertension-prevention',
    'health-screening-seniors',
    'medication-safety-tips',
  ];

  return articles.map(article => ({
    loc: `${baseUrl}/health/${article}`,
    lastmod: currentDate,
    changefreq: 'yearly' as const,
    priority: 0.5,
  }));
}

/**
 * Generate complete sitemap combining all pages
 */
export function generateSitemap(): SitemapUrl[] {
  return [
    ...getStaticPages(),
    ...getServicePages(),
    ...getDoctorPages(),
    ...getLocationPages(),
    ...getHealthArticles(),
  ];
}

/**
 * Convert sitemap URLs to XML format
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(({ loc, lastmod, changefreq, priority }) => {
      return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ''}${priority !== undefined ? `\n    <priority>${priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gabrielfamilyclinic.sg';
  
  return `# Gabriel Family Clinic - Robots.txt
# Healthcare-specific crawling rules

# Allow all search engines
User-agent: *
Allow: /

# Disallow private patient areas
Disallow: /patient/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

# Disallow form submission endpoints
Disallow: /api/appointments/submit
Disallow: /api/contact/submit

# Allow crawling of public services and information
Allow: /services/
Allow: /doctors/
Allow: /about
Allow: /contact
Allow: /locations/
Allow: /health/

# Crawl delay for healthcare sites (be gentle)
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Google-specific rules
User-agent: Googlebot
Allow: /
Disallow: /patient/
Disallow: /admin/
Crawl-delay: 1

# Bing-specific rules
User-agent: Bingbot
Allow: /
Disallow: /patient/
Disallow: /admin/
Crawl-delay: 1
`;
}
