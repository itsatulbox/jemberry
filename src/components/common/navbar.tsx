"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CartIcon from "@/assets/cart.svg";
import MenuIcon from "@/assets/menu.svg";
import CloseIcon from "@/assets/close.svg";
import Logo from "@/assets/jemberry_logo.webp";
import { useCart } from "@/context/cartContext";

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full relative">
      <div className="w-full flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex-shrink-0">
            <Image
              src={Logo}
              alt="Jemberry Logo"
              width={140}
              height={35}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <ul className="hidden md:flex flex-row gap-10 items-center whitespace-nowrap nav-links">
          <li>
            <Link
              href="/products"
              className="text-lg hover:text-primary transition-colors"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-lg hover:text-primary transition-colors"
            >
              About Me!
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              className="text-lg hover:text-primary transition-colors"
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-lg hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex-1 flex justify-end items-center gap-6">
          <Link href="/cart" className="flex items-center gap-2">
            <CartIcon className="w-7 h-7" />
            <span className="text-lg">{cart.length}</span>
          </Link>

          <button
            className="md:hidden p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <CloseIcon className="w-8 h-8" />
            ) : (
              <MenuIcon className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-primary z-[60] md:hidden">
          <ul className="flex flex-col p-8 gap-6">
            <li>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium"
              >
                About me!
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
