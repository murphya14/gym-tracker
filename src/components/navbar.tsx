import Link from "next/link";
import HomeIcon from "./icons/homeIcon";
import { usePathname } from "next/navigation";

const NavBar: React.FC = () => {
  const pathname = usePathname();

  const isHome = pathname?.includes("/home");

  return (
    <div className="mx-auto flex h-full max-w-md items-center justify-center border-t border-gray-200 bg-white pb-4">
      <Link
        href="/home"
        className={`flex flex-col items-center px-6 py-2 ${
          isHome
            ? "text-black"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <HomeIcon
          heightValue="6"
          widthValue="6"
          fill="none"
          strokeColor={
            isHome ? "black" : "currentColor"
          }
        />

        <span className="mt-1 text-xs font-medium">
          Home
        </span>
      </Link>
    </div>
  );
};

export default NavBar;