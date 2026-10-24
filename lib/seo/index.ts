import type { Opportunity } from "../db/schema";

const SITE_URL = process.env.APP_URL || "https://opportunities.campusloop.space";

export function getBaseUrl(): string {
  return SITE_URL;
}

/**
 * Google Sitelinks Search Box WebSite schema
 */
export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CampusLoop Opportunities",
    "url": SITE_URL,
    "description":
      "The premier discovery engine for verified internships, hackathons, scholarships, and fellowships for Indian college students.",
    "publisher": {
      "@type": "Organization",
      "name": "CampusLoop Labs",
      "url": "https://campusloop.space",
      "logo": `${SITE_URL}/logo.png`,
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Organization Schema
 */
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CampusLoop Opportunities",
    "legalName": "CampusLoop Labs",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "sameAs": [
      "https://campusloop.space",
      "https://github.com/campusloop-space",
      "https://twitter.com/campusloop",
      "https://www.linkedin.com/company/campusloop",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Student Support",
      "url": `${SITE_URL}/report`,
      "availableLanguage": ["English", "Hindi"],
    },
  };
}

/**
 * JobPosting or Event Schema for individual opportunity detail pages
 */
export function generateOpportunityJsonLd(opp: Opportunity) {
  const isJobLike =
    opp.category === "internships" ||
    opp.category === "fellowships" ||
    opp.category === "research";

  if (isJobLike) {
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opp.title,
      "description": opp.description,
      "datePosted": opp.publishedAt
        ? new Date(opp.publishedAt).toISOString()
        : new Date(opp.createdAt).toISOString(),
      "validThrough": opp.deadlineAt
        ? new Date(opp.deadlineAt).toISOString()
        : undefined,
      "employmentType": opp.category === "internships" ? "INTERN" : "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": opp.organizerName,
        "sameAs": opp.organizerWebsite || undefined,
        "logo":
          ((opp.metadata as Record<string, unknown>)?.logoUrl as string) ||
          `${SITE_URL}/icon-512x512.png`,
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": opp.location || "India / Worldwide",
          "addressCountry": "IN",
        },
      },
      "jobLocationType": opp.deliveryMode === "remote" ? "TELECOMMUTE" : undefined,
      "baseSalary": opp.stipendAmount
        ? {
            "@type": "MonetaryAmount",
            "currency": opp.stipendCurrency || "INR",
            "value": {
              "@type": "QuantitativeValue",
              "value": opp.stipendAmount,
              "unitText": "MONTH",
            },
          }
        : undefined,
      "url": `${SITE_URL}/opportunities/${opp.slug}`,
      "image":
        ((opp.metadata as Record<string, unknown>)?.logoUrl as string) ||
        `${SITE_URL}/og-image.png`,
    };
  }

  // Event / Hackathon / Competition / Student Program
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": opp.title,
    "description": opp.summary || opp.description,
    "image":
      ((opp.metadata as Record<string, unknown>)?.logoUrl as string) ||
      `${SITE_URL}/og-image.png`,
    "startDate": opp.applicationOpensAt
      ? new Date(opp.applicationOpensAt).toISOString()
      : undefined,
    "endDate": opp.deadlineAt ? new Date(opp.deadlineAt).toISOString() : undefined,
    "eventAttendanceMode":
      opp.deliveryMode === "remote"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : opp.deliveryMode === "in_person"
        ? "https://schema.org/OfflineEventAttendanceMode"
        : "https://schema.org/MixedEventAttendanceMode",
    "organizer": {
      "@type": "Organization",
      "name": opp.organizerName,
      "url": opp.organizerWebsite || undefined,
      "logo":
        ((opp.metadata as Record<string, unknown>)?.logoUrl as string) ||
        `${SITE_URL}/icon-512x512.png`,
    },
    "location": {
      "@type": "Place",
      "name": opp.location || "Online",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
      },
    },
    "url": `${SITE_URL}/opportunities/${opp.slug}`,
  };
}

/**
 * ItemList Carousel Schema for category feeds and homepage
 */
export function generateItemListJsonLd(opportunities: Opportunity[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": opportunities.map((opp, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": opp.title,
      "url": `${SITE_URL}/opportunities/${opp.slug}`,
      "description": opp.summary,
    })),
  };
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * FAQPage Schema
 */
export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}
