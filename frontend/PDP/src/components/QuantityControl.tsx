import { memo } from "react";

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const QuantityControl = memo(function QuantityControl({ value, min, max, onChange }: Props) {
  const disabled = max === 0;

  return (
    <div className="quantity-control">
      <button
        type="button"
        className="qty-btn"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="qty-value">{disabled ? 0 : value}</span>
      <button
        type="button"
        className="qty-btn"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
});

export default QuantityControl;
