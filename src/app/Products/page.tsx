import Header from "@/components/common/header";
import Navbar from "@/components/common/navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <Navbar />
      <Header />
      <div className="flex flex-col max-w-3xl mx-auto">
        <h1 className="mx-auto mb-8">Products</h1>
      </div>
    </div>
  );
}
