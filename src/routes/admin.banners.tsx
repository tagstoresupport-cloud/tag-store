import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Banner title", type: "text" },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "description", label: "Description", type: "textarea", full: true },
  { key: "image_path", label: "Banner image (desktop)", type: "image", folder: "banners" },
  { key: "mobile_image_path", label: "Banner image (mobile)", type: "image", folder: "banners" },
  { key: "button_text", label: "Button text", type: "text" },
  { key: "button_url", label: "Button URL", type: "text", placeholder: "/shop" },
  { key: "start_date", label: "Start date (optional)", type: "date" },
  { key: "end_date", label: "End date (optional)", type: "date" },
  { key: "is_active", label: "Active", type: "switch" },
];

function AdminBanners() {
  return (
    <AdminShell title="Banners">
      <CollectionEditor
        table="banners"
        title="Homepage banners"
        description="Create unlimited banners, schedule them, and drag to reorder. Active banners appear on the homepage."
        fields={FIELDS}
        titleKey="title"
        newRow={{
          title: "New banner",
          subtitle: "",
          description: "",
          button_text: "Shop Now",
          button_url: "/shop",
          is_active: true,
        }}
      />
    </AdminShell>
  );
}
