import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-widest">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">Featured</Link>
              </li>
              <li>
                <Link href="/products">All Products</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 uppercase tracking-widest">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">About me!</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary">
            © {new Date().getFullYear()} Jemberry. All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <Link
              href="https://www.atulkodla.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atul Kodla
            </Link>
          </p>{" "}
        </div>
      </div>
    </footer>
  );
}
