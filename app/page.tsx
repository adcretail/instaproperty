"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/app/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';

interface FilterData {
  city: string;
  locality: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
}

interface Property {
  id: string;
  title: string;
  city: string;
  locality: string;
  price: number;
  propertyType: string;
  images: string[];
  area: string;
  size: number;
  bhk: number;
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filterData, setFilterData] = useState<FilterData>({
    city: "",
    locality: "",
    minPrice: 0,
    maxPrice: 100000000,
    propertyType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
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
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "properties"));
      const querySnapshot = await getDocs(q);
      const propertiesList: Property[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      setProperties(propertiesList);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    return properties.filter(property => {
      return (
        (filterData.city ? property.city === filterData.city : true) &&
        (filterData.locality ? property.locality === filterData.locality : true) &&
        (filterData.minPrice ? property.price >= filterData.minPrice : true) &&
        (filterData.maxPrice ? property.price <= filterData.maxPrice : true) &&
        (filterData.propertyType ? property.propertyType === filterData.propertyType : true)
      );
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  };

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleCardClick = (propertyId: string) => {
    router.push(`/viewproperties?id=${propertyId}`);
  };

  return (
    <>
      <Head>
        <title>Real Estate Listings - Find Your Dream Property</title>
        <meta
          name="description"
          content="Explore the best real estate listings to find your dream property. Search by city, locality, price, and property type. Easily filter and view detailed property information."
        />
        <meta
          name="keywords"
          content="real estate, property listings, buy property, rent property, real estate search, property filter, house for sale, apartment for sale"
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="flex flex-col lg:flex-row min-h-screen bg-blue-100">
        <aside className="w-full lg:w-1/4 p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Filters</h2>
          <form onSubmit={handleFilterSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-black">City</h3>
              <input
                type="text"
                name="city"
                value={filterData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-black">Locality</h3>
              <input
                type="text"
                name="locality"
                value={filterData.locality}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-black">Budget</h3>
              <input
                type="number"
                name="minPrice"
                min="0"
                value={filterData.minPrice}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Min Price"
              />
              <input
                type="number"
                name="maxPrice"
                min="0"
                value={filterData.maxPrice}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-2"
                placeholder="Max Price"
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="font-bold text-black">₹0</span>
                <span className="font-bold text-black">₹100+ Crores</span>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-black">Type of Property</h3>
              <select
                name="propertyType"
                value={filterData.propertyType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="" className="font-bold text-black">Select Property Type</option>
                <option value="house" className="font-bold text-black">House</option>
                <option value="apartment" className="font-bold text-black">Apartment</option>
                <option value="plot" className="font-bold text-black">Plot</option>
                <option value="builderFloor" className="font-bold text-black">Builder Floor</option>
                <option value="cooperativeSociety" className="font-bold text-black">Cooperative Society</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded mt-4 w-full font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </aside>
        <section className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6 text-black">Properties</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterProperties().map(property => (
              <div
                key={property.id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleCardClick(property.id)}
              >
                {property.images.length > 0 && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                    loading="lazy"
                  />
                )}
                <h2 className="text-xl font-bold mb-2 text-black">{property.title}</h2>
                <p className="text-black font-bold mb-2">{property.area}</p>
                <p className="text-black font-bold">{property.city}</p>
                <p className="text-lg font-bold mt-2 text-black">₹{property.price}</p>
                <p className="text-sm font-bold text-black">{property.size} sqft | {property.bhk} BHK</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
