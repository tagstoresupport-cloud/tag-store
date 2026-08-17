import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/platforms")({
  component: AdminPlatforms,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Platform name", type: "text", placeholder: "PlayStation" },
  { key: "slug", label: "Slug", type: "text", placeholder: "playstation" },
  { key: "icon_path", label: "Platform icon / image", type: "image", folder: "platforms" },
  { key: "is_enabled", label: "Enabled", type: "switch" },
];

function AdminPlatforms() {
  return (
    <AdminShell title="Platforms">
      <CollectionEditor
        table="platforms"
        title="Platforms"
        description="Add any gaming platform (PlayStation, Xbox, Steam, EA App…). Enabled platforms appear on the storefront and can be selected on each product."
        fields={FIELDS}
        titleKey="name"
        newRow={{ name: "New platform", slug: "", is_enabled: true }}
      />
    </AdminShell>
  );
}
