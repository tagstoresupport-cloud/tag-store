import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin, useSession } from "@/lib/admin-auth";
import { supabase } from "@/integrations/supabase/client";

const NAV: {
  to: "/admin" | "/admin/products" | "/admin/product/$id" | "/admin/categories" | "/admin/orders" | "/admin/customers" | "/admin/settings";
  label: string;
  icon: typeof LayoutDashboard;
  exact: boolean;
  isNew?: boolean;
}[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/product/$id", label: "Add Product", icon: PlusCircle, exact: false, isNew: true },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];


export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { session, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(session?.user.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [loading, session, navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (loading || (session && roleLoading)) {
    return (
      <div className="min-h-screen space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account does not have administrator access.
          </p>
          <Button onClick={signOut} className="mt-6 rounded-xl">
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar p-4 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
            T
          </span>
          <span className="font-display font-bold">Tag Admin</span>
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) =>
            item.isNew ? (
              <Link
                key={item.label}
                to="/admin/product/$id"
                params={{ id: "new" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ),
          )}
        </nav>
        <Button variant="ghost" className="justify-start rounded-xl" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 sm:px-6">
          <h1 className="truncate font-display text-lg font-bold">{title}</h1>
          <Button variant="secondary" size="sm" className="rounded-xl lg:hidden" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 lg:hidden">
          {NAV.map((item) =>
            item.isNew ? (
              <Link
                key={item.label}
                to="/admin/product/$id"
                params={{ id: "new" }}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
