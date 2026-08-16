import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminCard, ImageField, SortableList, TextField, ToggleField } from "@/components/admin/cms-ui";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCollectionMutations } from "@/lib/cms";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "image" | "switch";
  folder?: string;
  placeholder?: string;
  full?: boolean;
};

type Row = Record<string, unknown> & { id: string };

export function CollectionEditor({
  table,
  title,
  description,
  fields,
  newRow,
  titleKey,
}: {
  table: string;
  title: string;
  description: string;
  fields: FieldDef[];
  newRow: Record<string, unknown>;
  titleKey: string;
}) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(table as any)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });
  const { create, update, remove, reorder } = useCollectionMutations(table);

  const [drafts, setDrafts] = useState<Record<string, Row>>({});

  useEffect(() => {
    setDrafts((prev) => {
      const next: Record<string, Row> = {};
      for (const row of rows) next[row.id] = prev[row.id] ?? row;
      return next;
    });
  }, [rows]);

  const setValue = (id: string, key: string, value: unknown) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] as Row), [key]: value } }));

  const save = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    const values: Record<string, unknown> = {};
    for (const f of fields) values[f.key] = draft[f.key] ?? (f.type === "switch" ? false : f.type === "image" || f.type === "date" ? null : "");
    try {
      await update.mutateAsync({ id, values });
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  };

  const add = async () => {
    try {
      await create.mutateAsync({ ...newRow, sort_order: rows.length });
      toast.success("Added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add");
    }
  };

  return (
    <AdminCard
      title={title}
      description={description}
      actions={
        <Button className="rounded-xl" onClick={() => void add()} disabled={create.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Add new
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing here yet. Click “Add new” to create your first entry.
        </p>
      ) : (
        <SortableList
          items={rows}
          onReorder={(ids) => reorder.mutate(ids)}
          renderItem={(row) => {
            const draft = drafts[row.id] ?? row;
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-sm font-semibold">
                    {String(draft[titleKey] ?? "") || "Untitled"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => void save(row.id)}
                      disabled={update.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-lg"
                      onClick={() => {
                        if (confirm("Delete this item?")) remove.mutate(row.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((f) => {
                    const value = draft[f.key];
                    if (f.type === "switch") {
                      return (
                        <ToggleField
                          key={f.key}
                          label={f.label}
                          checked={Boolean(value)}
                          onChange={(checked) => setValue(row.id, f.key, checked)}
                        />
                      );
                    }
                    if (f.type === "image") {
                      return (
                        <ImageField
                          key={f.key}
                          label={f.label}
                          folder={f.folder ?? "cms"}
                          path={(value as string | null) ?? null}
                          onChange={(path) => setValue(row.id, f.key, path)}
                        />
                      );
                    }
                    return (
                      <TextField
                        key={f.key}
                        label={f.label}
                        className={f.full ? "sm:col-span-2" : undefined}
                        textarea={f.type === "textarea"}
                        type={f.type === "date" ? "date" : "text"}
                        placeholder={f.placeholder ?? ""}
                        value={
                          f.type === "date"
                            ? String(value ?? "").slice(0, 10)
                            : String(value ?? "")
                        }
                        onChange={(v) =>
                          setValue(row.id, f.key, f.type === "date" ? (v || null) : v)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          }}
        />
      )}
    </AdminCard>
  );
}
