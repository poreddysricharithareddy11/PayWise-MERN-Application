import React from 'react';

const SEO = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PayWise",
    "description": "Secure online money transaction app for UPI payments, digital wallet, and financial management",
    "url": "https://pay-wise-mern-application.vercel.app/",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "UPI Payments",
      "Money Transfers",
      "Digital Wallet",
      "Financial Management",
      "Spending Analysis",
      "Category Management",
      "Transaction History",
      "Secure Payments"
    ],
    "author": {
      "@type": "Organization",
      "name": "PayWise"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "100"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default SEO; 