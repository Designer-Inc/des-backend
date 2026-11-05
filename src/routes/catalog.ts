import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { AppError } from "../lib/errors";
import { adminClient } from "../lib/supabase";

export const catalog = new Hono<AppEnv>();

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  is_active: boolean;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_minor: number;
  currency: string;
  production_method: "dtg" | "dtf" | "sublimation";
  fabric_type: string | null;
  is_active: boolean;
  category: CategoryRow | null;
}

interface VariantRow {
  id: string;
  sku: string;
  color_name: string;
  color_hex: string;
  size: string;
  price_delta_minor: number;
  stock_quantity: number;
  is_active: boolean;
}

interface PrintAreaRow {
  id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  offset_x_mm: number;
  offset_y_mm: number;
  mockup_px_per_mm: number;
  min_dpi: number;
}

interface DiscountTierRow {
  id: string;
  min_quantity: number;
  discount_percent: number;
  is_active: boolean;
}

interface ProductDetailRow extends ProductRow {
  is_customizable: boolean;
  variants: VariantRow[] | null;
  print_areas: PrintAreaRow[] | null;
  discount_tiers: DiscountTierRow[] | null;
}

const categorySelect =
  "category:categories(id,name,slug,description,position,is_active)";

const productSummarySelect = [
  "id",
  "name",
  "slug",
  "description",
  "base_price_minor",
  "currency",
  "production_method",
  "fabric_type",
  "is_active",
  categorySelect
].join(",");

const productDetailSelect = [
  productSummarySelect,
  "is_customizable",
  "variants:product_variants(id,sku,color_name,color_hex,size,price_delta_minor,stock_quantity,is_active)",
  "print_areas:print_areas(id,name,width_mm,height_mm,offset_x_mm,offset_y_mm,mockup_px_per_mm,min_dpi)",
  "discount_tiers:discount_tiers(id,min_quantity,discount_percent,is_active)"
].join(",");

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  categoryId: z.guid().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).default("newest")
});

function mapCategory(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    position: row.position,
    isActive: row.is_active
  };
}

function mapProductSummary(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ...(row.category ? { category: mapCategory(row.category) } : {}),
    basePriceMinor: row.base_price_minor,
    currency: row.currency,
    coverImageUrl: null,
    productionMethod: row.production_method,
    fabricType: row.fabric_type,
    isActive: row.is_active
  };
}

function mapProductDetail(row: ProductDetailRow) {
  return {
    ...mapProductSummary(row),
    description: row.description,
    isCustomizable: row.is_customizable,
    images: [],
    variants: (row.variants ?? []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      colorName: variant.color_name,
      colorHex: variant.color_hex,
      size: variant.size,
      priceDeltaMinor: variant.price_delta_minor,
      stockQuantity: variant.stock_quantity,
      mockupUrl: null,
      isActive: variant.is_active
    })),
    printAreas: (row.print_areas ?? []).map((area) => ({
      id: area.id,
      name: area.name,
      widthMm: Number(area.width_mm),
      heightMm: Number(area.height_mm),
      offsetXMm: Number(area.offset_x_mm),
      offsetYMm: Number(area.offset_y_mm),
      mockupPxPerMm: Number(area.mockup_px_per_mm),
      minDpi: area.min_dpi
    })),
    discountTiers: (row.discount_tiers ?? []).map((tier) => ({
      id: tier.id,
      minQuantity: tier.min_quantity,
      discountPercent: Number(tier.discount_percent),
      isActive: tier.is_active
    }))
  };
}

catalog.get("/categories", async (c) => {
  const { data, error } = await adminClient(c.env)
    .from("categories")
    .select("id,name,slug,description,position,is_active")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to load categories", error);
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load categories");
  }

  return c.json({
    items: ((data ?? []) as CategoryRow[]).map(mapCategory)
  });
});

catalog.get("/products", async (c) => {
  const parsed = listQuery.safeParse(c.req.query());
  if (!parsed.success) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid product query");
  }

  const { page, limit, q, categoryId, sort } = parsed.data;
  const from = (page - 1) * limit;

  let query = adminClient(c.env)
    .from("products")
    .select(productSummarySelect, { count: "exact" })
    .eq("is_active", true);

  if (q) {
    const escaped = q.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("name", `%${escaped}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("base_price_minor", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price_minor", { ascending: false });
      break;
    // No popularity counter yet; newest is the stable fallback.
    case "popular":
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, from + limit - 1);

  if (error) {
    console.error("Failed to load products", error);
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load products");
  }

  const total = count ?? 0;

  return c.json({
    items: ((data ?? []) as unknown as ProductRow[]).map(mapProductSummary),
    page,
    limit,
    total,
    hasMore: from + limit < total
  });
});

catalog.get("/products/:productId", async (c) => {
  const productId = z.guid().safeParse(c.req.param("productId"));
  if (!productId.success) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  const { data, error } = await adminClient(c.env)
    .from("products")
    .select(productDetailSelect)
    .eq("id", productId.data)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product", { productId: productId.data, error });
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load product");
  }

  if (!data) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  return c.json(mapProductDetail(data as unknown as ProductDetailRow));
});

// TODO: GET /designs, GET /designs/:id, GET /designs/mine, GET /search.
