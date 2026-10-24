import type { Opportunity } from "../db/schema";

const SITE_URL = process.env.APP_URL || "https://opportunities.campusloop.space";

export function getBaseUrl(): string {
  return SITE_URL;
}

export function generateOpportunityJsonLd(opp: Opportunity) {
  const isJobLike = opp.category === "internships" || opp.category === "fellowships" || opp.category === "research";
  
  if (isJobLike) {
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opp.title,
      "description": opp.description,
      "datePosted": opp.publishedAt ? new Date(opp.publishedAt).toISOString() : new Date(opp.createdAt).toISOString(),
      "validThrough": opp.deadlineAt ? new Date(opp.deadlineAt).toISOString() : undefined,
      "employmentType": opp.category === "internships" ? "INTERN" : "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": opp.organizerName,
        "sameAs": opp.organizerWebsite || undefined,
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": opp.location || "Worldwide",
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
    };
  }

  // Event / Hackathon / Competition
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": opp.title,
    "description": opp.summary,
    "startDate": opp.applicationOpensAt ? new Date(opp.applicationOpensAt).toISOString() : undefined,
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
    },
    "location": {
      "@type": "Place",
      "name": opp.location || "Online",
    },
    "url": `${SITE_URL}/opportunities/${opp.slug}`,
  };
}

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
