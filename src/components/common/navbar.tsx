"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CartIcon from "@/assets/cart.svg";
import MenuIcon from "@/assets/menu.svg";
import CloseIcon from "@/assets/close.svg";
import Logo from "@/assets/jemberry_logo.webp";
import { useCart } from "@/context/cartContext";

interface NavLink {
  href: string;
  label: string;
}

export default function Navbar({ navLinks }: { navLinks: NavLink[] }) {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [badgePop, setBadgePop] = useState(false);
  const prevCartLength = useRef(cart.length);

  useEffect(() => {
    if (cart.length > prevCartLength.current) {
      setBadgePop(true);
      const timer = setTimeout(() => setBadgePop(false), 300);
      return () => clearTimeout(timer);
    }
    prevCartLength.current = cart.length;
  }, [cart.length]);

  const isActive = (href: string) => {
    if (href === "/products") return pathname === "/products" || pathname.startsWith("/products/");
    return pathname === href;
  };

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
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-lg transition-colors ${
                  isActive(link.href)
                    ? "text-primary border-b-2 border-current pb-1 font-bold"
                    : "hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex-1 flex justify-end items-center gap-6">
          <Link href="/cart" className="flex items-center gap-2">
            <CartIcon className="w-7 h-7" />
            <span
              className={`text-lg ${badgePop ? "animate-badge-pop" : ""}`}
              key={cart.length}
            >
              {cart.length}
            </span>
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
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-xl font-medium ${
                    isActive(link.href) ? "text-primary font-bold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
