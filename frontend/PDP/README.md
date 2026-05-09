# PDP — Product Detail Page

A React + TypeScript + Vite e-commerce Product Detail Page (PDP) with variant selection, quantity control, and add-to-cart flow.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Quick Start

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Analytics

A typed analytics service (`src/analytics/index.ts`) emits structured events via `track(event, properties)`. Currently logging to the browser console — swap the implementation body to integrate with Google Analytics, Mixpanel, Segment, or any other provider.

### Events tracked

| Event | Trigger | Properties |
|---|---|---|
| `product_viewed` | Product data loads successfully | `productId`, `productName` |
| `variant_changed` | User selects a variant option | `dimension` (e.g. "color"), `value` (e.g. "black") |
| `add_to_cart` | Successful add-to-cart API call | `skuId`, `productId`, `productName`, `quantity`, `price`, `currency`, `attributes` |
| `desc_mode_toggled` | User switches description between Pretext / DOM mode | `mode` ("pretext" \| "dom") |
| `desc_resized` | User finishes dragging the description width slider | `width` (new), `from` (previous) |

### Design

- Every event is **fully typed** — `track("add_to_cart", { ... })` only accepts the properties defined for that event name
- Events include a `timestamp` (ms since epoch) set at call time
- The `track` function is the single integration point — replace its body to connect a real analytics backend

### Integration example

```ts
// src/analytics/index.ts

export function track<E extends EventName>(event: E, properties: PropsFor<E>) {
  // Replace console.log with your provider:
  window.gtag?.("event", event, properties);
  // analytics.track(event, properties);
}
```

## Performance Optimizations

### React.memo

`VariantSelector` and `QuantityControl` are wrapped in `React.memo` to skip re-rendering when their props haven't changed. This prevents the variant buttons and quantity controls from re-rendering when the parent updates due to unrelated state changes (e.g., cart feedback).

### useMemo

`currentSku` is derived via `useMemo` so the `product.skus.find(...)` scan only runs when `selectedVariants` or `product` change, not on every render. The `DescriptionSection` memoizes the pretext `prepare()` (cold path) and `layout()` (hot path) results to avoid redundant computation.

### useCallback

`handleVariantChange` uses the functional updater form of `setState`, making it stable (empty dependency array). `handleAddToCart` is memoized on its relevant dependencies to avoid passing new function references to child components.

### Lazy image loading

The product image and description inline images use the native `loading="lazy"` attribute to defer loading until they approach the viewport.

### @chenglou/pretext — Resizable description with instant text measurement

The description section uses [`@chenglou/pretext`](https://github.com/chenglou/pretext) to measure text layout **without touching the DOM**. A width slider (200–800px) lets you resize the description container, and a toggle switches between Pretext and DOM measurement modes.

**How it works:**

- **Cold path** (`prepare`): runs once when the description text loads, uses Canvas `measureText()` internally to build a word-width cache (~0.5–20ms depending on text length)
- **Hot path** (`layout`): pure arithmetic — given any container width, computes line breaks and height in **microseconds** (~0.01ms). Re-runs on every slider tick with no perceptible delay.
- **Image handling**: two small inline product images (SVG data URIs) have fixed, known heights. Their contribution is added to the pretext text height to produce a total block height prediction — still with zero DOM involvement.

**What you see in the UI:**

| Element | Pretext mode | DOM mode |
|---|---|---|
| Metrics badge | Green: "text 14 lines, 336px + images 164px = **500px** (0.008ms)" | Blue: "DOM measured: 502px (1.8ms)" |
| Resize behavior | Predicted height updates instantly at every slider tick | Height remeasured after browser reflow — visible lag |
| Comparison line | — | "Pretext measures text in 0.008ms + known image heights → total prediction without DOM reflow. DOM took **1.8ms** — ~**200x slower** with a full layout pass including image decode." |

**Why it matters:** In production apps with many text blocks (virtual scrolling, chat UIs, dynamic layouts), pretext's hot path can be **100–500x faster** than DOM measurement. The slider demo shows this in microcosm — dragging the width control triggers instant recalculation in Pretext mode vs. a visible reflow delay in DOM mode.
