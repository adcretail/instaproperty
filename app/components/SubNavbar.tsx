// components/CategoryNavbar.js
"use client";
import Link from "next/link";

function CategoryNavbar() {
  return (
    <nav className="bg-gray-200 p-4 flex justify-between items-center">
      <ul className="flex items-center justify-between w-full">
        <li className="mr-4">
          <Link href="/EditProperties" className="text-gray-700">
            Edit Properties
          </Link>
        </li>
        <li className="mr-4">
          <Link href="/viewshortlistedproperties" className="text-gray-700">
            Shortlisted Properties
          </Link>
        </li>
        <li className="mr-4">
          <Link href="/postproperties" className="text-gray-700">
            Post Property
          </Link>
        </li>
        <li>
          <Link href="/filterproperties" className="text-gray-700">
            Filter Properties
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default CategoryNavbar;