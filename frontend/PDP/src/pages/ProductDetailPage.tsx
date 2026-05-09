import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchProduct } from "../api/shop";
import type { Product, Sku } from "../data/products";
import { useCart } from "../context/CartContext";
import VariantSelector from "../components/VariantSelector";
import QuantityControl from "../components/QuantityControl";
import DescriptionSection from "../components/DescriptionSection";
import { track } from "../analytics";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchProduct()
      .then((p) => {
        setProduct(p);
        const initial: Record<string, number> = {};
        p.skus.forEach((sku) => {
          initial[sku.id] = sku.stock;
        });
        setStockMap(initial);
      })
      .catch(() => setError("Failed to load product. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Initialize default variant selections when product loads
  useEffect(() => {
    if (product) {
      const defaults: Record<string, string> = {};
      product.variantGroups.forEach((g) => {
        defaults[g.key] = g.options[0].value;
      });
      setSelectedVariants(defaults);
      track("product_viewed", {
        productId: product.id,
        productName: product.name,
      });
    }
  }, [product]);

  // Derive current SKU — memoized to avoid re-computation on unrelated renders
  const currentSku = useMemo<Sku | undefined>(() => {
    if (!product) return undefined;
    return product.skus.find((sku) =>
      Object.entries(selectedVariants).every(
        ([key, value]) => sku.attributes[key] === value
      )
    );
  }, [product, selectedVariants]);

  const currentStock = currentSku ? (stockMap[currentSku.id] ?? 0) : 0;
  const outOfStock = !currentSku || currentStock === 0;

  // Reset quantity when SKU changes
  useEffect(() => {
    setQuantity(1);
  }, [currentSku?.id]);

  // Clear feedback after timeout
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handleVariantChange = useCallback((key: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!currentSku || currentStock === 0) return;
    setAdding(true);
    try {
      const result = await addItem(currentSku.id, quantity);
      setStockMap((prev) => ({
        ...prev,
        [currentSku.id]: result.remainingStock,
      }));
      track("add_to_cart", {
        skuId: currentSku.id,
        productId: product!.id,
        productName: product!.name,
        quantity,
        price: currentSku.price,
        currency: "USD",
        attributes: currentSku.attributes,
      });
      setFeedback(`Added ${quantity} item(s) to cart`);
    } catch {
      setFeedback("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }, [currentSku, currentStock, quantity, addItem]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="pdp">
        <div className="pdp-status">Loading product...</div>
      </div>
    );
  }

  // --- Error state ---
  if (error || !product) {
    return (
      <div className="pdp">
        <div className="pdp-status pdp-status--error">
          <p>{error ?? "Something went wrong."}</p>
          <button type="button" className="btn-retry" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp">
      <div className="pdp-layout">
        {/* Product image */}
        <div className="pdp-gallery">
          <img
            className="pdp-image"
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
          />
        </div>

        {/* Product details */}
        <div className="pdp-details">
          <h1 className="pdp-name">{product.name}</h1>

          <p className="pdp-price">${currentSku?.price.toFixed(2) ?? "—"}</p>

          <p className={`pdp-stock ${outOfStock ? "pdp-stock--out" : "pdp-stock--in"}`}>
            {outOfStock ? "Out of stock" : `In stock (${currentStock} available)`}
          </p>

          {/* Variant selectors */}
          {product.variantGroups.map((group) => (
            <VariantSelector
              key={group.key}
              group={group}
              selected={selectedVariants[group.key] ?? null}
              onChange={(value) => {
                track("variant_changed", { dimension: group.key, value });
                handleVariantChange(group.key, value);
              }}
            />
          ))}

          {/* Quantity */}
          <div className="pdp-qty-row">
            <span className="variant-label">Quantity</span>
            <QuantityControl
              value={quantity}
              min={1}
              max={currentStock}
              onChange={setQuantity}
            />
          </div>

          {/* Add to cart */}
          <button
            type="button"
            className="btn-add-cart"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
          >
            {adding ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Feedback */}
          {feedback && <p className="pdp-feedback">{feedback}</p>}
        </div>
      </div>

      {/* Product description */}
      <section className="pdp-description">
        <h2>Description</h2>
        <DescriptionSection text={product.description} />
      </section>
    </div>
  );
}
