import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

import logoAsset from "@/assets/tag-store-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useStoreSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { data: settings } = useStoreSettings();

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <img
            src={logoAsset.url}
            alt={`${settings?.store_name ?? "Tag Store"} logo`}
            className="h-9 w-9 shrink-0 rounded-xl object-cover"
          />
          <span className="truncate font-display text-lg font-bold tracking-tight">
            {settings?.store_name ?? "Tag Store"}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link to="/cart" className="relative">
            <Button variant="secondary" size="icon" className="rounded-xl" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t transition-all duration-300 md:hidden",
          open ? "max-h-80" : "max-h-0 border-transparent",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
