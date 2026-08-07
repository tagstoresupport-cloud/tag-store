import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/lib/data";
import { slugify, type Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Category name is required");
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slugify(name),
        sort_order: categories.length,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      invalidate();
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ category, newName }: { category: Category; newName: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: newName.trim(), slug: slugify(newName) })
        .eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (category: Category) => {
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Categories">
      <div className="mx-auto max-w-2xl">
        <form
          className="glass grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl p-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Input
            placeholder="New category name"
            className="rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="shrink-0 rounded-xl font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Add
          </Button>
        </form>

        <div className="glass mt-5 rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <ul className="divide-y">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center gap-3 p-3">
                  <Input
                    defaultValue={category.name}
                    className="rounded-xl border-transparent bg-transparent"
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== category.name) {
                        rename.mutate({ category, newName: e.target.value });
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-xl text-destructive"
                    aria-label="Delete category"
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}"?`)) remove.mutate(category);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
