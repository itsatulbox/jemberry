import Image from "next/image";
type ShopItem = {
  name: string;
  price: string;
  url: string;
};
export default function ShopItem(ShopItem: ShopItem) {
  return (
    <div className="flex flex-col items-center">
      <Image src={ShopItem.url} alt={ShopItem.name} width={300} height={300} />
      <h2 className="mt-4">{ShopItem.name}</h2>
      <p className="mt-2">{ShopItem.price}</p>
    </div>
  );
}
