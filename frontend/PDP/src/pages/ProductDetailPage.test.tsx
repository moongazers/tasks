import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "../context/CartContext";
import ProductDetailPage from "./ProductDetailPage";
import type { Product } from "../data/products";

const mockProduct: Product = {
  id: "test-1",
  name: "Test Phone",
  description: "A test phone description.",
  images: ["https://placehold.co/600x600"],
  variantGroups: [
    {
      name: "Color",
      key: "color",
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    },
    {
      name: "Storage",
      key: "storage",
      options: [
        { label: "64GB", value: "64" },
        { label: "128GB", value: "128" },
      ],
    },
  ],
  skus: [
    {
      id: "test-red-64",
      attributes: { color: "red", storage: "64" },
      price: 499,
      stock: 5,
    },
    {
      id: "test-red-128",
      attributes: { color: "red", storage: "128" },
      price: 549,
      stock: 0,
    },
    {
      id: "test-blue-64",
      attributes: { color: "blue", storage: "64" },
      price: 499,
      stock: 3,
    },
    {
      id: "test-blue-128",
      attributes: { color: "blue", storage: "128" },
      price: 549,
      stock: 2,
    },
  ],
};

const { fetchProduct, addToCart } = vi.hoisted(() => ({
  fetchProduct: vi.fn(),
  addToCart: vi.fn(),
}));

vi.mock("../api/shop", () => ({ fetchProduct, addToCart }));

function renderPDP() {
  return render(
    <CartProvider>
      <ProductDetailPage />
    </CartProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProductDetailPage", () => {
  it("shows loading state initially", () => {
    fetchProduct.mockReturnValue(new Promise(() => {})); // never resolves
    renderPDP();
    expect(screen.getByText("Loading product...")).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    fetchProduct.mockRejectedValue(new Error("fail"));
    renderPDP();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load product/)).toBeInTheDocument();
    });
  });

  it("shows retry button on error and retries", async () => {
    fetchProduct.mockRejectedValueOnce(new Error("fail"));
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load product/)).toBeInTheDocument();
    });

    fetchProduct.mockResolvedValueOnce(mockProduct);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });
  });

  it("renders product name, price, and image after load", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    expect(screen.getByText("$499.00")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Test Phone" })).toBeInTheDocument();
  });

  it("shows in-stock status for the default SKU", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    // Default is red + 64GB → stock 5
    expect(screen.getByText("In stock (5 available)")).toBeInTheDocument();
  });

  it("updates price and stock when variant changes", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    // Switch storage to 128GB → price becomes $549.00, stock becomes 0 (red+128 out of stock)
    await userEvent.click(screen.getByRole("button", { name: "128GB" }));

    expect(screen.getByText("$549.00")).toBeInTheDocument();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("disables add-to-cart when out of stock", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    // red + 128GB is out of stock
    await userEvent.click(screen.getByRole("button", { name: "128GB" }));

    const btn = screen.getByRole("button", { name: "Out of Stock" });
    expect(btn).toBeDisabled();
  });

  it("adds to cart and shows feedback", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    addToCart.mockResolvedValue({ success: true, cartCount: 2, remainingStock: 4 });
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    await waitFor(() => {
      expect(screen.getByText("Added 1 item(s) to cart")).toBeInTheDocument();
    });
    expect(addToCart).toHaveBeenCalledWith("test-red-64", 1);
  });

  it("reduces displayed stock after adding to cart", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    addToCart.mockResolvedValue({ success: true, cartCount: 1, remainingStock: 3 });
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    expect(screen.getByText("In stock (5 available)")).toBeInTheDocument();

    // Increment qty to 2, add to cart
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    await waitFor(() => {
      expect(screen.getByText("In stock (3 available)")).toBeInTheDocument();
    });
  });

  it("respects quantity selection when adding to cart", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    addToCart.mockResolvedValue({ success: true, cartCount: 3, remainingStock: 2 });
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    // Increment to 3
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    await userEvent.click(screen.getByLabelText("Increase quantity"));

    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith("test-red-64", 3);
    });
  });

  it("resets quantity to 1 when SKU changes", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("Test Phone")).toBeInTheDocument();
    });

    // Increment to 3
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    expect(screen.getByText("3")).toBeInTheDocument();

    // Switch color → quantity resets to 1
    await userEvent.click(screen.getByRole("button", { name: "Blue" }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows product description", async () => {
    fetchProduct.mockResolvedValue(mockProduct);
    renderPDP();

    await waitFor(() => {
      expect(screen.getByText("A test phone description.")).toBeInTheDocument();
    });
  });
});
