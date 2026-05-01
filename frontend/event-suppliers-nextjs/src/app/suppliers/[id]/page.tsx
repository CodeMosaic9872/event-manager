import { notFound } from "next/navigation";
import { getSupplierProfile } from "@/shared/data/supplier-catalog";
import { SupplierProfileView } from "./supplier-profile-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierPage({ params }: PageProps) {
  const { id } = await params;
  const profile = getSupplierProfile(id);
  if (!profile) notFound();

  return <SupplierProfileView profile={profile} />;
}
