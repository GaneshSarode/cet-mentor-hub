export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "CET Mentor Hub",
    url: "https://cetmentorhub.com",
    logo: "https://cetmentorhub.com/logo.png",
    description:
      "Free MHT-CET guidance by real VJTI students. College predictor, PYQ online tests with auto-grading, and 1:1 mentorship — completely free.",
    foundingDate: "2024",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    sameAs: ["https://chat.whatsapp.com/FT9zIkNqsbt4yNQDDkEGaU"],
    offers: {
      "@type": "Offer",
      category: "Educational Service",
      price: "0",
      priceCurrency: "INR",
      description: "Free MHT-CET preparation resources and mentorship",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CET Mentor Hub",
    url: "https://cetmentorhub.com",
    description:
      "Free MHT-CET guidance by real VJTI students. Practice PYQs online, predict your college, and get 1:1 mentorship.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://cetmentorhub.com/colleges?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function QuizJsonLd({
  name,
  description,
  questionCount,
  url,
}: {
  name: string;
  description: string;
  questionCount: number;
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name,
    description,
    educationalLevel: "12th Standard",
    numberOfQuestions: questionCount,
    about: {
      "@type": "Thing",
      name: "MHT-CET Exam",
    },
    provider: {
      "@type": "Organization",
      name: "CET Mentor Hub",
      url: "https://cetmentorhub.com",
    },
    isAccessibleForFree: true,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
