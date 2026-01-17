import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome to the admin dashboard!</p>
      <Link href="/admin/products" className="mt-6 text-blue-500 underline">
        Manage Products
      </Link>
    </div>
  );
}
