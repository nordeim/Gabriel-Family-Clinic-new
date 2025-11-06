// Healthcare Structured Data Schemas for SEO

export interface HealthcareSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

// Medical service schema
export function createMedicalServiceSchema(
  serviceName: string,
  description: string,
  provider: string = 'Gabriel Family Clinic'
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: serviceName,
    description,
    provider: {
      '@type': 'MedicalOrganization',
      name: provider
    },
    audience: {
      '@type': 'PeopleAudience',
      name: 'Senior Citizens',
      suggestedMinAge: 65
    },
    howPerformed: 'Face-to-face consultation with accessibility support',
    availableLocation: 'Singapore'
  }
}

// Physician schema
export function createPhysicianSchema(
  name: string,
  specialty: string,
  education: string,
  description: string
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name,
    description,
    medicalSpecialty: specialty,
    education,
    memberOf: {
      '@type': 'MedicalOrganization',
      name: 'Gabriel Family Clinic'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Singapore',
      addressCountry: 'SG'
    },
    availableService: {
      '@type': 'MedicalTherapy',
      name: 'Elderly Health Check',
      description: 'Comprehensive health screening for seniors with accessibility features'
    }
  }
}

// FAQ schema for healthcare queries
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Breadcrumb schema
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

// Healthcare article schema
export function createHealthcareArticleSchema(
  title: string,
  description: string,
  author: string,
  datePublished: string,
  dateModified: string
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gabriel Family Clinic',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gabrielfamilyclinic.sg/logo.png'
      }
    },
    datePublished,
    dateModified,
    specialty: 'Family Medicine',
    about: {
      '@type': 'MedicalCondition',
      name: 'Elderly Healthcare'
    }
  }
}

// Helper to inject schema into page
export function injectStructuredData(schema: HealthcareSchema | HealthcareSchema[]) {
  const schemaArray = Array.isArray(schema) ? schema : [schema]
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaArray.length === 1 ? schemaArray[0] : schemaArray)
      }}
    />
  )
}
