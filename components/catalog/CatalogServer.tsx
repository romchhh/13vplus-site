import CatalogClient from "./CatalogClient";
import CatalogGenderTabs from "./CatalogGenderTabs";
import { subcategoryLeafName } from "@/lib/subcategory";
import {
  sqlGetAllProducts,
  sqlGetProductsByCategory,
  sqlGetProductsBySeason,
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors,
  sqlGetCategoriesByGender,
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import {
  PRODUCT_GENDER_LABELS,
  type ProductGender,
} from "@/lib/productGender";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
}

interface CatalogServerProps {
  gender: ProductGender;
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { gender, category, season, subcategory } = params;

  try {
    if (subcategory) {
      return await sqlGetProductsBySubcategoryName(subcategory, gender);
    }
    if (category) {
      return await sqlGetProductsByCategory(category, gender);
    }
    if (season) {
      return await sqlGetProductsBySeason(season, gender);
    }
    return await sqlGetAllProducts(gender);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getColors(): Promise<{ color: string; hex?: string }[]> {
  try {
    const data = await sqlGetAllColors();
    return data;
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
}

async function getCategories(gender: ProductGender): Promise<{ id: number; name: string }[]> {
  try {
    const data = await sqlGetCategoriesByGender(gender);
    return data.map((c) => ({ id: c.id, name: c.name }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CatalogServer(props: CatalogServerProps) {
  const [products, colors, categories] = await Promise.all([
    getProducts(props),
    getColors(),
    getCategories(props.gender),
  ]);

  const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";
  const genderLabel = PRODUCT_GENDER_LABELS[props.gender];
  const categoryName =
    props.category || (props.subcategory ? subcategoryLeafName(props.subcategory) : null);

  const query = new URLSearchParams();
  query.set("gender", props.gender);
  if (props.subcategory) query.set("subcategory", props.subcategory);
  else if (props.category) query.set("category", props.category);
  else if (props.season) query.set("season", props.season);

  const catalogUrl = `${baseUrl}/catalog?${query.toString()}`;
  const pageName = categoryName || `${genderLabel} — Каталог`;
  const pageDescription = categoryName
    ? `Каталог «${categoryName}» (${genderLabel.toLowerCase()}) від 13VPLUS.`
    : `Каталог одягу ${genderLabel.toLowerCase()} від 13VPLUS.`;

  const breadcrumbs = [
    { name: "Головна", url: baseUrl },
    { name: "Каталог", url: `${baseUrl}/catalog` },
    { name: genderLabel, url: `${baseUrl}/catalog?gender=${props.gender}` },
    ...(categoryName ? [{ name: categoryName, url: catalogUrl }] : []),
  ];

  return (
    <>
      <CollectionPageStructuredData
        name={pageName}
        description={pageDescription}
        url={catalogUrl}
        baseUrl={baseUrl}
        itemCount={products.length}
        category={categoryName || undefined}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <CatalogClient
        gender={props.gender}
        initialProducts={products}
        colors={colors}
        categories={categories}
      />
    </>
  );
}
