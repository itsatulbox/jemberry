import Image from "next/image";
import Logo from "@/assets/jemberry_logo.webp";
import Link from "next/link";

export default function Header() {
  return (
    <div className="relative px-10 py-16">
      <Link href="/">
        <Image
          src={Logo}
          alt={`Jemberry Studio Logo`}
          width={480}
          className="object-contain mx-auto"
        />
      </Link>
    </div>
  );
}
