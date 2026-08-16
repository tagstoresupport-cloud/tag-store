import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/promotions")({
  component: AdminPromotions,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea", full: true },
  { key: "image_path", label: "Image", type: "image", folder: "promotions" },
  { key: "button_text", label: "Button text", type: "text" },
  { key: "button_url", label: "Button URL", type: "text", placeholder: "/shop" },
  { key: "is_enabled", label: "Enabled", type: "switch" },
];

function AdminPromotions() {
  return (
    <AdminShell title="Promotional Sections">
      <CollectionEditor
        table="promotions"
        title="Promotional sections"
        description="Unlimited promo blocks shown on the homepage. Drag to change their order."
        fields={FIELDS}
        titleKey="title"
        newRow={{
          title: "New promotion",
          description: "",
          button_text: "Shop Now",
          button_url: "/shop",
          is_enabled: true,
        }}
      />
    </AdminShell>
  );
}
