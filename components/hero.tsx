import Image from "next/image";
import logo from "@/public/logo.png"; // Stelle sicher, dass logo.png in /public liegt

export default function Header() {
  return (
    <div className="flex flex-col items-center my-8">
      <Image
        src={logo}
        alt="Logo"
        width={200} // Größe nach Bedarf anpassen
        height={200}
        priority
      />
    </div>
  );
}
