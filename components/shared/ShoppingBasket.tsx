import Image from "next/image";

export default function ShoppingBasket() {
  return (
    <button
      className="cursor-pointer"
      // onClick={}
    >
      <Image
        height="32"
        width="32"
        alt="shopping basket"
        src="/images/light-theme/cart.svg"
      />
    </button>
  );
}
