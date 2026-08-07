import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/lib/orders-data";
import { formatEGP } from "@/lib/types";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data: orders = [], isLoading } = useOrders();
  const [search, setSearch] = useState("");

  const customers = Object.values(
    orders.reduce<
      Record<string, { name: string; phone: string; email: string; orders: number; spent: number; last: string }>
    >((acc, order) => {
      const key = order.phone || order.email;
      const entry = acc[key] ?? {
        name: order.customer_name,
        phone: order.phone,
        email: order.email,
        orders: 0,
        spent: 0,
        last: order.created_at,
      };
      entry.orders += 1;
      entry.spent += Number(order.total);
      if (order.created_at > entry.last) entry.last = order.created_at;
      acc[key] = entry;
      return acc;
    }, {}),
  ).sort((a, b) => b.spent - a.spent);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(search)
    );
  });

  return (
    <AdminShell title="Customers">
      <Input
        placeholder="Search customers..."
        className="max-w-sm rounded-xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="glass mt-5 overflow-hidden rounded-2xl">
        {isLoading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No customers yet.</p>
        ) : (
          <ul className="divide-y">
            {filtered.map((customer) => (
              <li key={customer.phone + customer.email} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{customer.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {customer.phone} · {customer.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">{formatEGP(customer.spent)}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.orders} order{customer.orders === 1 ? "" : "s"} · last{" "}
                    {new Date(customer.last).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
