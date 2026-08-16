import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/social")({
  component: AdminSocial,
});

const FIELDS: FieldDef[] = [
  { key: "platform", label: "Platform", type: "text", placeholder: "Facebook" },
  { key: "url", label: "URL", type: "text", placeholder: "https://facebook.com/…" },
  {
    key: "icon",
    label: "Icon (facebook, instagram, tiktok, youtube, whatsapp, twitter, telegram, link)",
    type: "text",
    full: true,
  },
  { key: "is_enabled", label: "Enabled", type: "switch" },
];

function AdminSocial() {
  return (
    <AdminShell title="Social Media">
      <CollectionEditor
        table="social_links"
        title="Social media links"
        description="Shown in the site footer. Drag to reorder."
        fields={FIELDS}
        titleKey="platform"
        newRow={{ platform: "Facebook", url: "", icon: "facebook", is_enabled: true }}
      />
    </AdminShell>
  );
}
