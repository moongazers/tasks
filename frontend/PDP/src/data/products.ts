export interface VariantOption {
  label: string;
  value: string;
}

export interface VariantGroup {
  name: string;
  key: string;
  options: VariantOption[];
}

export interface Sku {
  id: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  variantGroups: VariantGroup[];
  skus: Sku[];
}

export const product: Product = {
  id: "wh-pro",
  name: "Wireless Headphones Pro",
  description:
    "Premium wireless headphones with active noise cancellation, 30-hour battery life, and studio-quality sound. Features comfortable over-ear cushions, Bluetooth 5.3, and multipoint connection for seamless switching between devices.\n\n" +
    "Key Features\n" +
    "Active Noise Cancellation (ANC) with adjustable transparency mode lets you tune out the world or let it in. 30-hour battery life with quick charge — just 10 minutes of charging gives you 3 hours of playback. Bluetooth 5.3 with multipoint connection for seamless switching between your phone, laptop, and tablet. 40mm custom drivers deliver rich, detailed audio with deep bass and crisp highs.\n\n" +
    "Technical Specifications\n" +
    "Driver size: 40mm | Frequency response: 4Hz–40kHz | Impedance: 32Ω | Sensitivity: 105dB SPL/mW | Weight: 250g | Charging: USB-C, 10min quick charge = 3hrs playback | Battery life: 30hrs (ANC on), 40hrs (ANC off) | Bluetooth range: 10m / 33ft\n\n" +
    "What's in the Box\n" +
    "Wireless Headphones Pro, USB-C charging cable, 3.5mm audio cable, airplane adapter, hard-shell carrying case, and quick start guide. All packaged in a premium recyclable box.",
  images: ["https://placehold.co/600x600/1a1a2e/eee?text=Headphones+Pro"],
  variantGroups: [
    {
      name: "Color",
      key: "color",
      options: [
        { label: "Midnight Black", value: "black" },
        { label: "Arctic White", value: "white" },
        { label: "Forest Green", value: "green" },
      ],
    },
    {
      name: "Size",
      key: "size",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Large", value: "large" },
      ],
    },
  ],
  skus: [
    {
      id: "wh-pro-black-standard",
      attributes: { color: "black", size: "standard" },
      price: 299.99,
      stock: 10,
    },
    {
      id: "wh-pro-black-large",
      attributes: { color: "black", size: "large" },
      price: 299.99,
      stock: 5,
    },
    {
      id: "wh-pro-white-standard",
      attributes: { color: "white", size: "standard" },
      price: 309.99,
      stock: 3,
    },
    {
      id: "wh-pro-white-large",
      attributes: { color: "white", size: "large" },
      price: 309.99,
      stock: 0,
    },
    {
      id: "wh-pro-green-standard",
      attributes: { color: "green", size: "standard" },
      price: 319.99,
      stock: 7,
    },
    {
      id: "wh-pro-green-large",
      attributes: { color: "green", size: "large" },
      price: 319.99,
      stock: 2,
    },
  ],
};
