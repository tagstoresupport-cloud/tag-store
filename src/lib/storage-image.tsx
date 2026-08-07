import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signPath(
  path: string | null | undefined,
  bucket = "product-images",
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, ONE_WEEK);
  return data?.signedUrl ?? null;
}

export function useSignedUrl(path: string | null | undefined, bucket = "product-images") {
  return useQuery({
    queryKey: ["signed-url", bucket, path],
    queryFn: () => signPath(path, bucket),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 60,
  });
}

export function StorageImage({
  path,
  alt,
  className,
  bucket = "product-images",
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  bucket?: string;
}) {
  const { data: url } = useSignedUrl(path, bucket);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6 opacity-50" />
      </div>
    );
  }

  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
