import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory, getItem, relatedFor } from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItem(slug);
  return {
    title: item?.name ?? "Product",
    description: item?.blurb,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item || item.kind !== "product") notFound();
  const [aisle, related] = await Promise.all([getCategory(item.category), relatedFor(item)]);

  return <ProductDetail item={item} aisle={aisle} related={related} />;
}
