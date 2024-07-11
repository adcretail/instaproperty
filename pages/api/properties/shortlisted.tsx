"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ShortlistedProperties() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [shortlistedProperties, setShortlistedProperties] = useState<any[]>([]);
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
        router.push('/Signin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchShortlistedProperties = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/shortlisting/shortlisted?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setShortlistedProperties(data.shortlistedProperties);
          } else {
            console.error('Error fetching shortlisted properties:', await response.json());
          }
        } catch (error) {
          console.error('Error fetching shortlisted properties:', error);
        }
      }
    };

    fetchShortlistedProperties();
  }, [user]);

  if (!user) {
    return <div>You need to be logged in to view shortlisted properties</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Shortlisted Properties</h1>
        {shortlistedProperties.length === 0 ? (
         
         <p>No properties shortlisted yet.</p>
        ) : (
          shortlistedProperties.map((property) => (
            <div key={property.id} className="mb-6">
              {property.images && property.images.length > 0 && (
                <img src={property.images[0]} loading="lazy" alt={property.title} className="w-full h-64 object-cover rounded-md mb-4" />
              )}
              <h2 className="text-xl font-bold mb-2">{property.title}</h2>
              <p className="text-gray-700 mb-2"><strong>Owner:</strong> {property.ownerName}</p>
              <p className="text-gray-700 mb-2"><strong>Price:</strong> Rs {property.price}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}