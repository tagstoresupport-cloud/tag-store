import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Tag Store" },
      {
        name: "description",
        content: "The terms that apply to buying digital PlayStation games from Tag Store.",
      },
      { property: "og:title", content: "Terms & Conditions — Tag Store" },
      { property: "og:description", content: "Terms that apply to purchases from Tag Store." },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Please read these terms before ordering."
      sections={[
        {
          heading: "Digital products",
          body: "All products sold on Tag Store are digital. Depending on the option you choose, you may receive account credentials, an activation code, or an invitation to play. What you receive is described on the product page.",
        },
        {
          heading: "Orders and payment",
          body: "An order is only processed after we verify the Vodafone Cash payment matching the order total. Uploading a valid payment screenshot is required. Orders with missing or unclear payment proof may be cancelled.",
        },
        {
          heading: "Delivery",
          body: "Orders are delivered manually after payment verification. Delivery times may vary depending on order volume and working hours.",
        },
        {
          heading: "Refunds",
          body: "Because the products are digital, orders cannot be refunded after delivery. If an order cannot be delivered, the amount paid is refunded to the same Vodafone Cash number.",
        },
        {
          heading: "Account rules",
          body: "For shared account options, you must not change the account password, email, or security settings. Violating these rules ends any support or replacement for that order.",
        },
        {
          heading: "Changes",
          body: "We may update prices, product availability and these terms at any time. The version shown on this page is the version that applies.",
        },
      ]}
    />
  ),
});
