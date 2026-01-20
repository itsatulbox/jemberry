import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest">
              Shop
            </h3>
            <ul className="space-y-2">
               <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  All Products
                </Link>
              </li>
           </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary text-xs">
            © {new Date().getFullYear()} Jemberry. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-primary text-xs uppercase tracking-widest">
              Auckland, NZ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
