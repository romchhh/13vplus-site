import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import CategoriesTable from "@/components/admin/tables/CategoriesTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Категорії | 13VPLUS Admin",
  description: "Управління категоріями товарів",
};

export default function CategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Категорії" />
      <div className="space-y-6">
        <CategoriesTable />
      </div>
    </div>
  );
}

