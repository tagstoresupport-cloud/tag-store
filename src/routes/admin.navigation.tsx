import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/navigation")({
  component: AdminNavigation,
});

const FIELDS: FieldDef[] = [
  { key: "label", label: "Menu label", type: "text" },
  { key: "url", label: "URL", type: "text", placeholder: "/shop" },
  { key: "is_visible", label: "Visible", type: "switch" },
];

function AdminNavigation() {
  return (
    <AdminShell title="Navigation">
      <CollectionEditor
        table="nav_items"
        title="Header navigation"
        description="Control the menu items shown in the site header. Drag to reorder."
        fields={FIELDS}
        titleKey="label"
        newRow={{ label: "New link", url: "/", is_visible: true }}
      />
    </AdminShell>
  );
}
