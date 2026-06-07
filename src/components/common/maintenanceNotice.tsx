// Shared maintenance UI — used by the /maintenance page and the error
// boundaries. No hooks/data, so it renders anywhere (server or client).
import Image from "next/image";
import Logo from "@/assets/logo.webp";

export default function MaintenanceNotice() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 text-primary">
      <div className="max-w-md text-center flex flex-col items-center">
        <Image
          src={Logo}
          alt="Jemberry"
          width={200}
          height={50}
          className="object-contain"
          priority
        />
        <h1 className="mt-10 text-3xl font-bold leading-snug">
          Under maintenance
        </h1>
        <p className="mt-4 text-base opacity-80">Check back soon!</p>
      </div>
    </main>
  );
}
