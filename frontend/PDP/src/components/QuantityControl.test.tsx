import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantityControl from "./QuantityControl";

describe("QuantityControl", () => {
  it("displays the current value", () => {
    render(
      <QuantityControl value={3} min={1} max={10} onChange={() => {}} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays 0 when max is 0", () => {
    render(
      <QuantityControl value={1} min={1} max={0} onChange={() => {}} />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("increments when + is clicked", async () => {
    const onChange = vi.fn();
    render(
      <QuantityControl value={3} min={1} max={10} onChange={onChange} />
    );
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("decrements when − is clicked", async () => {
    const onChange = vi.fn();
    render(
      <QuantityControl value={3} min={1} max={10} onChange={onChange} />
    );
    await userEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables − when at min", () => {
    render(
      <QuantityControl value={1} min={1} max={10} onChange={() => {}} />
    );
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
  });

  it("disables + when at max", () => {
    render(
      <QuantityControl value={10} min={1} max={10} onChange={() => {}} />
    );
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });

  it("disables both buttons when max is 0", () => {
    render(
      <QuantityControl value={1} min={1} max={0} onChange={() => {}} />
    );
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });
});
