import type { Metadata } from 'next'

// Healthcare organization structured data
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'Gabriel Family Clinic',
  description: 'Comprehensive family healthcare services in Singapore with elderly-friendly design and CHAS compatibility',
  url: 'https://gabrielfamilyclinic.sg',
  telephone: '+65-6123-4567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Medical Drive',
    addressLocality: 'Singapore',
    postalCode: '123456',
    addressCountry: 'SG'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '1.3521',
    longitude: '103.8198'
  },
  medicalSpecialty: ['Family Medicine', 'Preventive Care', 'Elderly Care'],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Medical License',
    recognizedBy: {
      '@type': 'Organization',
      name: 'Singapore Medical Council'
    }
  },
  openingHours: 'Mo-Fr 08:00-18:00, Sa 08:00-12:00',
  priceRange: '$$',
  paymentAccepted: 'Cash, Credit Card, CHAS, Medisave',
  areaServed: 'Singapore',
  knowsAbout: ['Elderly Healthcare', 'CHAS', 'Family Medicine', 'Preventive Care']
}

// Healthcare website metadata
export const healthcareMetadata: Metadata = {
  metadataBase: new URL('https://gabrielfamilyclinic.sg'),
  title: {
    default: 'Gabriel Family Clinic - Senior-Friendly Healthcare in Singapore',
    template: '%s | Gabriel Family Clinic'
  },
  description: 'Elderly-accessible family healthcare in Singapore with CHAS compatibility, WCAG AAA compliance, and comprehensive medical services for seniors.',
  keywords: [
    'family doctor singapore',
    'elderly healthcare singapore',
    'CHAS clinic singapore',
    'accessible healthcare singapore',
    'family medicine clinic',
    'senior health screening',
    'elderly-friendly clinic',
    'WCAG AAA healthcare',
    'singapore general practitioner',
    'preventive healthcare singapore'
  ],
  authors: [{ name: 'Gabriel Family Clinic' }],
  creator: 'Gabriel Family Clinic',
  publisher: 'Gabriel Family Clinic',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_SG',
    url: 'https://gabrielfamilyclinic.sg',
    siteName: 'Gabriel Family Clinic',
    title: 'Gabriel Family Clinic - Senior-Friendly Healthcare in Singapore',
    description: 'Elderly-accessible family healthcare with CHAS compatibility and WCAG AAA compliance. Comprehensive medical services for seniors in Singapore.',
    images: [
      {
        url: '/og-image-healthcare.png',
        width: 1200,
        height: 630,
        alt: 'Gabriel Family Clinic - Senior-Friendly Healthcare',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gabriel Family Clinic - Senior-Friendly Healthcare in Singapore',
    description: 'Elderly-accessible family healthcare with CHAS compatibility and accessibility features.',
    images: ['/twitter-healthcare-card.png'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://gabrielfamilyclinic.sg',
  },
  category: 'Healthcare',
}

// Page-specific metadata generators
export function generateServiceMetadata(serviceName: string, description: string): Metadata {
  return {
    title: `${serviceName} | Gabriel Family Clinic Singapore`,
    description,
    openGraph: {
      title: `${serviceName} | Gabriel Family Clinic`,
      description,
      type: 'website',
    },
  }
}

export function generateDoctorMetadata(doctorName: string, specialty: string): Metadata {
  return {
    title: `${doctorName} - ${specialty} | Gabriel Family Clinic`,
    description: `Board-certified ${specialty} physician specializing in elderly care and accessible medical consultations in Singapore.`,
    openGraph: {
      title: `${doctorName} - ${specialty} | Gabriel Family Clinic`,
      description: `Board-certified ${specialty} physician specializing in elderly care.`,
      type: 'profile',
    },
  }
}

// Local business schema for Singapore SEO
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Gabriel Family Clinic',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Medical Drive',
    addressLocality: 'Singapore',
    addressCountry: 'SG',
    postalCode: '123456'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 1.3521,
    longitude: 103.8198
  },
  telephone: '+65-6123-4567',
  openingHours: 'Mo-Fr 08:00-18:00, Sa 08:00-12:00',
  priceRange: '$$',
  paymentAccepted: ['Cash', 'Credit Card', 'CHAS', 'Medisave'],
  currenciesAccepted: 'SGD',
  areaServed: 'Singapore',
  knowsAbout: ['Elderly Care', 'Family Medicine', 'CHAS', 'Healthcare Accessibility']
}
