"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import OwnerMobileDialog from '../components/OTPDialog';

export default function ViewProperties() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          id: user.uid,
          email: user.email,
        });
      } else {
        setUser(null);
        router.push("/Signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        {user && <PropertyDetails user={user} />}
      </Suspense>
    </main>
  );
}

function PropertyDetails({ user }: { user: { id: string; email: string | null } }) {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get("id");
  const [property, setProperty] = useState<any>(null);
  const [showOwnerMobileDialog, setShowOwnerMobileDialog] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (propertyId) {
        try {
          const propertyDoc = await getDoc(doc(db, "properties", propertyId));
          if (propertyDoc.exists()) {
            setProperty(propertyDoc.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching property:", error);
        }
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleContactClick = () => {
    if (!user) {
      alert("You need to be logged in to contact the owner");
      return;
    }
    setShowOwnerMobileDialog(true);
  };

  const handleShortlist = async () => {
    if (!user) {
      alert("You need to be logged in to shortlist a property");
      return;
    }

    try {
      const response = await fetch("/api/properties/shortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          propertyId: propertyId,
        }),
      });

      if (response.ok) {
        alert("Property shortlisted successfully");
      } else {
        const errorData = await response.json();
        console.error("Error shortlisting property:", errorData);
        alert("Error shortlisting property");
      }
    } catch (error) {
      console.error("Error shortlisting property:", error);
      alert("Error shortlisting property");
    }
  };

  if (!propertyId) {
    return <div>Property ID is required</div>;
  }

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
      {property.images && property.images.length > 0 && (
        <img
          src={property.images[0]}
          loading="lazy"
          alt={property.title}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-4">{property.title}</h1>
      <p className="text-gray-700 mb-4">{property.content}</p>
      <p className="text-gray-700 mb-2"><strong>Owner:</strong> {property.ownerName}</p>
      <p className="text-gray-700 mb-2"><strong>Floor:</strong> {property.floor}</p>
      <p className="text-gray-700 mb-2"><strong>Price:</strong> Rs {property.price}</p>
      <button
        className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-700"
        onClick={handleContactClick}
      >
        Contact
      </button>
      <button
        className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-700"
        onClick={handleShortlist}
      >
        Shortlist
      </button>
      {showOwnerMobileDialog && <OwnerMobileDialog property={property} onClose={() => setShowOwnerMobileDialog(false)} />}
    </div>
  );
}
