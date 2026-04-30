// Centralized navigation. Every link routes to /shop with params Shop.tsx understands.
// Params used by Shop: cat (category), q (free-text search), collection (collection slug).

export type MenuLink = { label: string; to: string };
export type MenuColumn = { heading: string; links: MenuLink[] };
export type MegaMenu = {
  id: string;
  label: string;
  to: string; // fallback link when clicking the top label
  columns: MenuColumn[];
  feature?: { title: string; copy: string; cta: string; to: string };
  accent?: boolean;
};

export const megaMenus: MegaMenu[] = [
  {
    id: "new",
    label: "New In",
    to: "/shop?cat=new",
    columns: [
      {
        heading: "Just Dropped",
        links: [
          { label: "All New", to: "/shop?cat=new" },
          { label: "New Tops", to: "/shop?cat=new&q=tee" },
          { label: "New Shirts", to: "/shop?cat=new&q=shirt" },
          { label: "New Polos", to: "/shop?cat=new&q=polo" },
        ],
      },
      {
        heading: "Highlights",
        links: [
          { label: "Bestsellers", to: "/shop?q=bestseller" },
          { label: "Limited Editions", to: "/shop?q=limited" },
          { label: "Resort '25", to: "/shop?collection=resort-25" },
        ],
      },
    ],
    feature: {
      title: "Resort '25",
      copy: "Linen, light cottons, easy silhouettes.",
      cta: "Shop the drop",
      to: "/shop?collection=resort-25",
    },
  },
  {
    id: "clothing",
    label: "Clothing",
    to: "/shop",
    columns: [
      {
        heading: "Tops",
        links: [
          { label: "T-shirts", to: "/shop?q=tee" },
          { label: "Polos", to: "/shop?q=polo" },
          { label: "Henleys", to: "/shop?q=henley" },
          { label: "Knits", to: "/shop?q=knit" },
        ],
      },
      {
        heading: "Shirts",
        links: [
          { label: "Linen", to: "/shop?q=linen" },
          { label: "Oxford", to: "/shop?q=oxford" },
          { label: "Camp Collar", to: "/shop?q=camp" },
        ],
      },
      {
        heading: "Shop By Style",
        links: [
          { label: "Daily Essentials", to: "/shop?collection=daily-essentials" },
          { label: "Heritage", to: "/shop?collection=heritage" },
          { label: "Street Edit", to: "/shop?collection=street-edit" },
        ],
      },
    ],
  },
  {
    id: "men",
    label: "Men",
    to: "/shop?cat=men",
    columns: [
      {
        heading: "Shop Men",
        links: [
          { label: "All Men", to: "/shop?cat=men" },
          { label: "Tees", to: "/shop?cat=men&q=tee" },
          { label: "Shirts", to: "/shop?cat=men&q=shirt" },
          { label: "Polos", to: "/shop?cat=men&q=polo" },
        ],
      },
      {
        heading: "By Collection",
        links: [
          { label: "Heritage", to: "/shop?cat=men&collection=heritage" },
          { label: "Resort '25", to: "/shop?cat=men&collection=resort-25" },
          { label: "Daily Essentials", to: "/shop?cat=men&collection=daily-essentials" },
        ],
      },
    ],
  },
  {
    id: "women",
    label: "Women",
    to: "/shop?cat=women",
    columns: [
      {
        heading: "Shop Women",
        links: [
          { label: "All Women", to: "/shop?cat=women" },
          { label: "Tees", to: "/shop?cat=women&q=tee" },
          { label: "Knits", to: "/shop?cat=women&q=knit" },
        ],
      },
      {
        heading: "By Collection",
        links: [
          { label: "Daily Essentials", to: "/shop?cat=women&collection=daily-essentials" },
          { label: "Resort '25", to: "/shop?cat=women&collection=resort-25" },
        ],
      },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    to: "/shop",
    columns: [
      {
        heading: "Collections",
        links: [
          { label: "Daily Essentials", to: "/shop?collection=daily-essentials" },
          { label: "Heritage", to: "/shop?collection=heritage" },
          { label: "Resort '25", to: "/shop?collection=resort-25" },
          { label: "Street Edit", to: "/shop?collection=street-edit" },
        ],
      },
    ],
  },
  {
    id: "sale",
    label: "Sale",
    to: "/shop?q=sale",
    accent: true,
    columns: [
      {
        heading: "On Sale",
        links: [
          { label: "All Sale", to: "/shop?q=sale" },
          { label: "Up to 30% Off", to: "/shop?q=sale" },
        ],
      },
    ],
  },
];
