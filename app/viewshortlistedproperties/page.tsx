"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/app/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ShortlistedProperties() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          id: user.uid,
          email: user.email,
        });
        await fetchShortlistedProperties(user.uid);
      } else {
        setUser(null);
        router.push('/Signin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchShortlistedProperties = async (userId: string) => {
    try {
      const response = await fetch(`/api/properties/shortlist?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.shortlistedProperties.map((shortlist: any) => shortlist.property));
      } else {
        console.error('Failed to fetch shortlisted properties');
      }
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-black">Shortlisted Properties</h1>
        {properties.length > 0 ? (
          properties.map((property) => (
            <Link href={`/viewproperties?id=${property.id}`} key={property.id}>
              <span className="block mb-4 hover:bg-gray-200 rounded-lg p-4">
                {property.images && property.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    {property.images.map((image: string, index: number) => (
                      <div key={index} className="relative w-full h-32">
                        <Image
                          src={image}
                          alt={property.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2 text-black">{property.title}</h2>
                <p className="text-black font-bold mb-2"><strong>Owner:</strong> {property.ownerName}</p>
                <p className="text-black font-bold mb-2"><strong>Price:</strong> Rs {property.price}</p>
              </span>
            </Link>
          ))
        ) : (
          <p className="text-black font-bold">No properties shortlisted</p>
        )}
      </div>
    </main>
  );
}
