import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import PromoCodesSection from "@/components/admin/PromoCodesSection";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Промокоди | Choice Admin",
  description: "Генерація та управління промокодами зі знижкою % або фіксованою сумою",
};

export default function PromoCodesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Промокоди" />
      <div className="space-y-6">
        <PromoCodesSection />
      </div>
    </div>
  );
}
