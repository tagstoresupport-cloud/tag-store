import { createFileRoute } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/faqs")({
  component: AdminFaqs,
});

const FIELDS: FieldDef[] = [
  { key: "question", label: "Question", type: "text", full: true },
  { key: "answer", label: "Answer", type: "textarea", full: true },
  { key: "is_enabled", label: "Enabled", type: "switch" },
];

function AdminFaqs() {
  return (
    <AdminShell title="FAQ">
      <CollectionEditor
        table="faqs"
        title="Frequently asked questions"
        description="These questions power the FAQ page and the homepage FAQ section."
        fields={FIELDS}
        titleKey="question"
        newRow={{ question: "New question", answer: "", is_enabled: true }}
      />
    </AdminShell>
  );
}
