import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VariantSelector from "./VariantSelector";
import type { VariantGroup } from "../data/products";

const group: VariantGroup = {
  name: "Color",
  key: "color",
  options: [
    { label: "Black", value: "black" },
    { label: "White", value: "white" },
  ],
};

describe("VariantSelector", () => {
  it("renders all options", () => {
    render(
      <VariantSelector group={group} selected={null} onChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "Black" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "White" })).toBeInTheDocument();
  });

  it("highlights the selected option", () => {
    render(
      <VariantSelector group={group} selected="white" onChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "White" })).toHaveClass(
      "variant-btn--selected"
    );
    expect(screen.getByRole("button", { name: "Black" })).not.toHaveClass(
      "variant-btn--selected"
    );
  });

  it("calls onChange when an option is clicked", async () => {
    const onChange = vi.fn();
    render(
      <VariantSelector group={group} selected="black" onChange={onChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: "White" }));
    expect(onChange).toHaveBeenCalledWith("white");
  });
});
