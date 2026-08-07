import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/lib/orders-data";
import { signPath, StorageImage } from "@/lib/storage-image";
import { formatEGP, ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-primary/15 text-primary",
  Confirmed: "bg-blue-500/15 text-blue-400",
  Processing: "bg-yellow-500/15 text-yellow-400",
  Completed: "bg-emerald-500/15 text-emerald-400",
  Cancelled: "bg-destructive/15 text-destructive",
};

function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: async ({ order, status }: { order: Order; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (order: Order) => {
      const { error } = await supabase.from("orders").delete().eq("id", order.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = orders.filter((order) => {
    const q = search.toLowerCase();
    const matchesSearch =
      order.order_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.phone.includes(search) ||
      order.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openScreenshot = async (path: string | null) => {
    const url = await signPath(path, "payment-screenshots");
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Screenshot not available");
  };

  return (
    <AdminShell title="Orders">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by order, name, phone or email..."
          className="max-w-sm rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass mt-5 overflow-hidden rounded-2xl">
        {isLoading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <ul className="divide-y">
            {filtered.map((order) => {
              const expanded = open === order.id;
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : order.id)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 text-left hover:bg-secondary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {order.order_number} · {order.customer_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()} · {order.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold">{formatEGP(Number(order.total))}</span>
                      <Badge className={cn("border-0", STATUS_STYLES[order.status])}>
                        {order.status}
                      </Badge>
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                      />
                    </div>
                  </button>

                  {expanded && (
                    <div className="grid gap-6 border-t bg-secondary/20 p-4 lg:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Customer
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>{order.customer_name}</p>
                          <p className="text-muted-foreground">{order.phone}</p>
                          <p className="text-muted-foreground">{order.email}</p>
                          {order.notes && (
                            <p className="pt-2 text-muted-foreground">Notes: {order.notes}</p>
                          )}
                        </div>

                        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Items
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                                <StorageImage
                                  path={item.image}
                                  alt={item.product_name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm">{item.product_name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.variant_name} × {item.quantity}
                                </p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold">
                                {formatEGP(Number(item.price) * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Payment proof
                        </h3>
                        {order.payment_screenshot_path ? (
                          <div className="mt-2">
                            <StorageImage
                              path={order.payment_screenshot_path}
                              bucket="payment-screenshots"
                              alt="Payment screenshot"
                              className="max-h-64 w-full rounded-xl object-contain"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              className="mt-2 rounded-xl"
                              onClick={() => void openScreenshot(order.payment_screenshot_path)}
                            >
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open full size
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">No screenshot.</p>
                        )}

                        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateStatus.mutate({ order, status: status as OrderStatus })
                            }
                          >
                            <SelectTrigger className="w-44 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-destructive"
                            onClick={() => {
                              if (confirm(`Delete order ${order.order_number}?`)) remove.mutate(order);
                            }}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
