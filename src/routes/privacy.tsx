import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Tag Store" },
      {
        name: "description",
        content: "How Tag Store collects, uses and protects your personal data and payment proof.",
      },
      { property: "og:title", content: "Privacy Policy — Tag Store" },
      { property: "og:description", content: "How Tag Store handles your personal data." },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we handle your information."
      sections={[
        {
          heading: "Information we collect",
          body: "When you place an order we collect your full name, phone number, email address, any notes you add, and the payment screenshot you upload. We do not collect card details — payment happens outside our website through Vodafone Cash.",
        },
        {
          heading: "How we use your information",
          body: "Your information is used only to verify your payment, deliver your order, and contact you about that order. We do not sell or share your data with third parties for marketing.",
        },
        {
          heading: "Payment screenshots",
          body: "Payment screenshots are stored in private storage. They are not publicly accessible and can only be opened by the store administrator to verify a payment.",
        },
        {
          heading: "Data retention",
          body: "Order records are kept for as long as needed to support the order and comply with our records. You may request deletion of your personal data by contacting support.",
        },
        {
          heading: "Security",
          body: "Access to orders, customer information and payment proof is restricted to authenticated administrator accounts, and all data is protected by database-level access rules.",
        },
        {
          heading: "Contact",
          body: "For any privacy question, contact us using the phone number listed on our Contact page.",
        },
      ]}
    />
  ),
});
