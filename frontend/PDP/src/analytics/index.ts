type EventName =
  | "product_viewed"
  | "variant_changed"
  | "add_to_cart"
  | "desc_mode_toggled"
  | "desc_resized";

interface AddToCartProps {
  skuId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency: string;
  attributes: Record<string, string>;
}

interface VariantChangedProps {
  dimension: string;
  value: string;
}

type PropsFor<E extends EventName> = E extends "product_viewed"
  ? { productId: string; productName: string }
  : E extends "add_to_cart"
    ? AddToCartProps
    : E extends "variant_changed"
      ? VariantChangedProps
      : E extends "desc_mode_toggled"
        ? { mode: "pretext" | "dom" }
        : E extends "desc_resized"
          ? { width: number; from: number }
          : never;

/**
 * Emit an analytics event. Currently logs to console — swap the body
 * to integrate with Google Analytics, Mixpanel, Segment, etc.
 */
export function track<E extends EventName>(
  event: E,
  properties: PropsFor<E>,
): void {
  const payload = {
    event,
    timestamp: Date.now(),
    properties,
  };
  console.log("[analytics]", payload);

  // Example integration point:
  // gtag('event', event, properties);
  // analytics.track(event, properties);
}
