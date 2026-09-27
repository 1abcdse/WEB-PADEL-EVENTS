import type { Metadata } from "next";
import { PairApp } from "./PairApp";

export const metadata: Metadata = {
  title: "Els meus partits · Lliga Social de Pàdel",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PairPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PairApp token={token} />;
}
