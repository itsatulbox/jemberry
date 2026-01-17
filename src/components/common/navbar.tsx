import Link from "next/link";
import Search from "@/assets/search.svg";
import Cart from "@/assets/cart.svg";

export default function Navbar() {
  return (
    <nav className="flex flex-row justify-between w-full items-center px-8 py-4">
      <ul className="flex flex-row gap-4 text-xl items-center">
        <li>
          <Link className="p-2" href="/products">
            Products
          </Link>
        </li>
         <li>
          <Link className="p-2" href="/about">
            Read me !
          </Link>
        </li>
        <li>
          <Link className="p-2" href="/faq">Keycap commission FAQ</Link>
        </li>
        <li>
          <Link className="p-2" href="/contact">
            Contact
          </Link>
        </li>
      </ul>
      <ul className="flex flex-row justify-evenly gap-8 items-center">
        <li>
          <button className="flex items-center p-2">
            <Search />
          </button>
        </li>
        <li>
          <Link href="/cart" className="flex items-center gap-3 p-2">
            <Cart />
            <span className="text-xl leading-none">0</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
