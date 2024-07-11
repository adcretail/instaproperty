"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from '../firebase'; // Import firebase config
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Navbar = () => {
  const [user, setUser] = useState<null | User>(null); // Initialize with null | User
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Now the type is compatible
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/Signin');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <nav className="bg-blue-200 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/" passHref>
          <span className="flex items-center">
            <Image
              src="/instaproperty.jpeg"
              alt="Instaproperty Logo"
              width={50}
              height={50}
              className="object-contain"
            />
          </span>
        </Link>
      </div>
      <div className="flex items-center ml-4 gap-4">
        {user ? (
          <>
            <Link href="/account">
              <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Account
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/Signin">
            <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
