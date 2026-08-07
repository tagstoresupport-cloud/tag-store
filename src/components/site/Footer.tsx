import { Link } from "@tanstack/react-router";
import { Phone, Wallet } from "lucide-react";

import { useStoreSettings } from "@/lib/data";

export function Footer() {
  const { data: settings } = useStoreSettings();
  const year = new Date().getFullYear();
  const socials = settings?.social_links ?? {};

  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              T
            </span>
            <span className="font-display text-lg font-bold">
              {settings?.store_name ?? "Tag Store"}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings?.footer_text ?? "Tag Store — Premium PlayStation digital games."}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Store</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="transition-colors hover:text-primary">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition-colors hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition-colors hover:text-primary">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-primary">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Support</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span dir="ltr">{settings?.support_phone ?? "01205665404"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 shrink-0 text-primary" />
              <span dir="ltr">{settings?.vodafone_number ?? "01068012140"}</span>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-primary">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
          {Object.keys(socials).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {Object.entries(socials).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="capitalize text-muted-foreground transition-colors hover:text-primary"
                >
                  {key}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {year} {settings?.store_name ?? "Tag Store"}. All rights reserved.
      </div>
    </footer>
  );
}
