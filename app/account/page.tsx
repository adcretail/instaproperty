"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase"; // Import firebase config
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface UserDetails {
  email: string;
  mobile: string;
  name: string;
}

const AccountPage = () => {
  const [user, setUser] = useState<null | User>(null);
  const [userDetails, setUserDetails] = useState<null | UserDetails>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserDetails(user.uid);
      } else {
        router.push("/Signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserDetails(userDoc.data() as UserDetails);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-black mb-4">Account Details</h1>
        {userDetails ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-bold text-black">Name:</span>
              <span className="ml-2 font-bold text-black">{userDetails.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-black">Email:</span>
              <span className="ml-2 font-bold text-black">{userDetails.email}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-black">Mobile:</span>
              <span className="ml-2 font-bold text-black">{userDetails.mobile}</span>
            </div>
          </div>
        ) : (
          <p className="font-bold text-black">Loading user details...</p>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
