import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings } from "@/lib/data";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const SOCIAL_KEYS = ["facebook", "instagram", "tiktok", "whatsapp"] as const;

function AdminSettings() {
  const { data: settings } = useStoreSettings();
  const queryClient = useQueryClient();

  const [storeName, setStoreName] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [vodafoneNumber, setVodafoneNumber] = useState("");
  const [footerText, setFooterText] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings) return;
    setStoreName(settings.store_name);
    setSupportPhone(settings.support_phone);
    setVodafoneNumber(settings.vodafone_number);
    setFooterText(settings.footer_text ?? "");
    setSocial(settings.social_links ?? {});
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("store_settings")
        .update({
          store_name: storeName.trim(),
          support_phone: supportPhone.trim(),
          vodafone_number: vodafoneNumber.trim(),
          footer_text: footerText.trim(),
          social_links: social,
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Store settings">
      <form
        className="glass mx-auto max-w-2xl space-y-4 rounded-2xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <Label htmlFor="store-name">Store name</Label>
          <Input
            id="store-name"
            className="mt-2 rounded-xl"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="support-phone">Support phone / WhatsApp</Label>
          <Input
            id="support-phone"
            className="mt-2 rounded-xl"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="vodafone">Vodafone Cash number</Label>
          <Input
            id="vodafone"
            className="mt-2 rounded-xl"
            value={vodafoneNumber}
            onChange={(e) => setVodafoneNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="footer-text">Footer text</Label>
          <Textarea
            id="footer-text"
            rows={3}
            className="mt-2 rounded-xl"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => (
            <div key={key}>
              <Label htmlFor={`social-${key}`} className="capitalize">
                {key} link
              </Label>
              <Input
                id={`social-${key}`}
                className="mt-2 rounded-xl"
                placeholder="https://"
                value={social[key] ?? ""}
                onChange={(e) => setSocial((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={save.isPending} className="rounded-xl font-semibold">
          {save.isPending ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </AdminShell>
  );
}
