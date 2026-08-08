import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_yohij5k";
const TEMPLATE_ID = "template_qo3waw7";
const PUBLIC_KEY = "zvmwDePDTx1oimhnw";
const STORE_EMAIL = "tagstore.support@gmail.com";

const SENT_KEY = "tagstore_order_notifications";

type NotifyItem = {
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type NotifyPayload = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  notes?: string;
  total: number;
  items: NotifyItem[];
};

function alreadySent(orderNumber: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(SENT_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (list.includes(orderNumber)) return true;
    window.localStorage.setItem(SENT_KEY, JSON.stringify([...list.slice(-49), orderNumber]));
    return false;
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget store notification. Never throws — an email failure must not
 * affect an order that is already saved in the database.
 */
export async function notifyStoreOfOrder(payload: NotifyPayload): Promise<void> {
  try {
    if (alreadySent(payload.order_number)) return;

    const units = payload.items.reduce((sum, i) => sum + i.quantity, 0);
    const ordersText = payload.items
      .map(
        (i) =>
          `${i.product_name} (${i.variant_name}) x${i.quantity} — EGP ${(
            i.price * i.quantity
          ).toLocaleString()}`,
      )
      .join("\n");

    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: STORE_EMAIL,
        email: payload.customer_email,
        reply_to: payload.customer_email,
        order_id: payload.order_number,
        name: payload.customer_name,
        phone: payload.phone,
        notes: payload.notes ?? "",
        orders: ordersText,
        orders_list: payload.items.map((i) => ({
          name: `${i.product_name} (${i.variant_name})`,
          units: i.quantity,
          price: i.price,
          image: i.image ?? "",
        })),
        price: payload.total,
        units,
        "cost.shipping": 0,
        "cost.tax": 0,
        cost: { shipping: "0.00", tax: "0.00", total: payload.total.toFixed(2) },
      },
      { publicKey: PUBLIC_KEY },
    );
  } catch (error) {
    console.error("[EmailJS] Failed to send order notification:", error);
  }
}
