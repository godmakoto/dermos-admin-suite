import { Product, Order, Category, Subcategory, Brand, Label, OrderStatus } from "@/types";

export const mockCategories: Category[] = [
  { id: "1", name: "Cuidado Facial" },
  { id: "2", name: "Cuidado Corporal" },
  { id: "3", name: "Protección Solar" },
  { id: "4", name: "Anti-Edad" },
];

export const mockSubcategories: Subcategory[] = [
  { id: "1", name: "Limpiadores", categoryId: "1" },
  { id: "2", name: "Hidratantes", categoryId: "1" },
  { id: "3", name: "Serums", categoryId: "1" },
  { id: "4", name: "Cremas Corporales", categoryId: "2" },
  { id: "5", name: "Exfoliantes", categoryId: "2" },
  { id: "6", name: "Protector SPF 50+", categoryId: "3" },
  { id: "7", name: "Cremas Antiarrugas", categoryId: "4" },
];

export const mockBrands: Brand[] = [
  { id: "1", name: "La Roche-Posay" },
  { id: "2", name: "Bioderma" },
  { id: "3", name: "CeraVe" },
  { id: "4", name: "Avène" },
  { id: "5", name: "Eucerin" },
];

export const mockLabels: Label[] = [
  { id: "1", name: "Nuevo", color: "#22c55e" },
  { id: "2", name: "Bestseller", color: "#3b82f6" },
  { id: "3", name: "Oferta", color: "#ef4444" },
  { id: "4", name: "Agotado", color: "#6b7280" },
];

export const mockOrderStatuses: OrderStatus[] = [
  { id: "1", name: "Pendiente", color: "#f59e0b" },
  { id: "2", name: "Procesando", color: "#3b82f6" },
  { id: "3", name: "Enviado", color: "#8b5cf6" },
  { id: "4", name: "Entregado", color: "#22c55e" },
  { id: "5", name: "Cancelado", color: "#ef4444" },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Effaclar Duo+ Crema",
    price: 185.5,
    category: "Cuidado Facial",
    subcategory: "Hidratantes",
    brand: "La Roche-Posay",
    label: "Bestseller",
    shortDescription: "Tratamiento corrector para imperfecciones",
    longDescription: "Effaclar Duo (+) es un tratamiento corrector desobstruyente anti-imperfecciones anti-marcas. Corrige las imperfecciones severas y previene su reaparición.",
    usage: "Aplicar por la mañana y/o por la noche sobre el rostro limpio.",
    ingredients: "Aqua, Glycerin, Dimethicone, Isocetyl Stearate, Niacinamide...",
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"],
    stock: 25,
    status: "Activo",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Sensibio H2O Agua Micelar",
    price: 120.0,
    category: "Cuidado Facial",
    subcategory: "Limpiadores",
    brand: "Bioderma",
    label: "Nuevo",
    shortDescription: "Agua micelar desmaquillante para pieles sensibles",
    longDescription: "La primera y única agua dermatológica micelar perfectamente compatible con la piel. Limpia, desmaquilla y calma la piel.",
    usage: "Empapar un disco de algodón y limpiar el rostro, ojos y labios.",
    ingredients: "Aqua, PEG-6 Caprylic/Capric Glycerides, Fructooligosaccharides...",
    images: ["https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400"],
    stock: 15,
    status: "Activo",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Crema Hidratante Facial",
    price: 95.0,
    category: "Cuidado Facial",
    subcategory: "Hidratantes",
    brand: "CeraVe",
    label: "Oferta",
    shortDescription: "Hidratación 24h con ceramidas esenciales",
    longDescription: "Crema hidratante desarrollada con dermatólogos para pieles secas a muy secas. Contiene 3 ceramidas esenciales y ácido hialurónico.",
    usage: "Aplicar sobre el rostro y cuerpo según sea necesario.",
    ingredients: "Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride...",
    images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400"],
    stock: 0,
    status: "Agotado",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "",
    customerEmail: "",
    items: [
      { id: "1", productId: "1", productName: "Effaclar Duo+ Crema", quantity: 2, price: 185.5 },
      { id: "2", productId: "2", productName: "Sensibio H2O Agua Micelar", quantity: 1, price: 120.0 },
    ],
    subtotal: 491.0,
    discount: 0,
    total: 491.0,
    status: "Pendiente",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "ORD-002",
    customerName: "",
    customerEmail: "",
    items: [
      { id: "3", productId: "3", productName: "Crema Hidratante Facial", quantity: 3, price: 95.0 },
    ],
    subtotal: 285.0,
    discount: 28.5,
    total: 256.5,
    status: "Enviado",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2024-03-02"),
  },
  {
    id: "ORD-003",
    customerName: "",
    customerEmail: "",
    items: [
      { id: "4", productId: "1", productName: "Effaclar Duo+ Crema", quantity: 1, price: 185.5 },
    ],
    subtotal: 185.5,
    discount: 0,
    total: 185.5,
    status: "Entregado",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-01"),
  },
];
