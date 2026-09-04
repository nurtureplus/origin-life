import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-display text-3xl font-medium">New product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
