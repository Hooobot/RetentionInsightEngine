"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RIE_Logo from "@/public/RIE_Logo2.png";

const Navbar = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/">
        <Image src={RIE_Logo} alt="RIE Logo" width={70} height={63} />
      </Link>
      <button
        className="mobile-nav-toggle"
        aria-expanded={isNavExpanded}
        onClick={() => setIsNavExpanded(!isNavExpanded)}
      >
        <div className="hamburger"></div>
      </button>
      <div className={`nav-links ${isNavExpanded ? "expanded" : ""}`}>
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
