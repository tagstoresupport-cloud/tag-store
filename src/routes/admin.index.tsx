import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ShoppingBag, Clock, Wallet } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/lib/data";
import { useOrders } from "@/lib/orders-data";
import { formatEGP } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: products = [] } = useProducts({ adminView: true });
  const { data: orders = [] } = useOrders();

  const pending = orders.filter((o) => o.status === "Pending");
  const revenue = orders
    .filter((o) => o.status === "Completed")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Products", value: String(products.length), icon: Package },
    { label: "Orders", value: String(orders.length), icon: ShoppingBag },
    { label: "Pending orders", value: String(pending.length), icon: Clock },
    { label: "Completed revenue", value: formatEGP(revenue), icon: Wallet },
  ];

  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-3 truncate font-display text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Latest orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{order.order_number}</p>
                  <p className="truncate text-xs text-muted-foreground">{order.customer_name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold">{formatEGP(Number(order.total))}</span>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
