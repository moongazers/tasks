import { memo } from "react";
import type { VariantGroup } from "../data/products";

interface Props {
  group: VariantGroup;
  selected: string | null;
  onChange: (value: string) => void;
}

const VariantSelector = memo(function VariantSelector({ group, selected, onChange }: Props) {
  return (
    <fieldset className="variant-group">
      <legend className="variant-label">{group.name}</legend>
      <div className="variant-options">
        {group.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`variant-btn ${selected === opt.value ? "variant-btn--selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
});

export default VariantSelector;
