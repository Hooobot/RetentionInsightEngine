import Link from "next/link";
import Image from "next/image";
import RIE_Logo from "@/public/RIE_Logo2.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link href="/">
          <Image
            src={RIE_Logo}
            alt="RIE Logo"
            width={70}
            height={63}
            objectFit="contain"
          />
        </Link>
      </div>
      <div className="nav-links">
        <Link href="/">
          <span className="nav-link">Home</span>
        </Link>
        <Link href="/dashboard">
          <span className="nav-link">Dashboard</span>
        </Link>
        <Link href="/contact">
          <span className="nav-link">Contact</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
