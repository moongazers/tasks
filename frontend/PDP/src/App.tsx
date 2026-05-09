import { CartProvider, useCart } from "./context/CartContext";
import ProductDetailPage from "./pages/ProductDetailPage";

function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return <span className="cart-badge">{count}</span>;
}

function App() {
  return (
    <CartProvider>
      <header className="app-header">
        <h1 className="app-logo">Shop</h1>
        <div className="app-cart">
          🛒
          <CartBadge />
        </div>
      </header>
      <main>
        <ProductDetailPage />
      </main>
    </CartProvider>
  );
}

export default App;
