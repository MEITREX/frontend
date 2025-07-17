"use client"

// app/shop/page.tsx
import { redirect } from "next/navigation";

export default function ShopIndexPage() {
    redirect("/items/inventory");
}
