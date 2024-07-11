"use client";

import Image from "next/image";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, QueryConstraint } from "firebase/firestore";
import { db } from "@/app/firebase";

interface FilterData {
  city: string;
  locality: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  option: string;
}

interface Property {
  id: string;
  title: string;
  content: string;
  city: string;
  area: string;
  locality: string;
  floor: string;
  propertyType: string;
  transactionType: string;
  option: string;
  price: string;
  areaSqft: string;
  ownerName: string;
  contactNumber: string;
  facingDirection: string;
  status: string;
  images: string[];
}

const FilterProperties: React.FC = () => {
  const router = useRouter();
  const [filterData, setFilterData] = useState<FilterData>({
    city: "",
    locality: "",
    minPrice: 0,
    maxPrice: 0,
    propertyType: "house",
    option: "sell",
  });
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push("/Signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const conditions: QueryConstraint[] = [];
      if (filterData.city) conditions.push(where("city", "==", filterData.city));
      if (filterData.locality) conditions.push(where("locality", "==", filterData.locality));
      if (filterData.minPrice) conditions.push(where("price", ">=", filterData.minPrice));
      if (filterData.maxPrice) conditions.push(where("price", "<=", filterData.maxPrice));
      if (filterData.propertyType) conditions.push(where("propertyType", "==", filterData.propertyType));
      if (filterData.option) conditions.push(where("option", "==", filterData.option));

      const q = query(collection(db, "properties"), ...conditions);
      const querySnapshot = await getDocs(q);

      const propertiesList: Property[] = [];
      querySnapshot.forEach((doc) => {
        propertiesList.push({ id: doc.id, ...doc.data() } as Property);
      });

      setProperties(propertiesList);
    } catch (err) {
      console.error("Error fetching properties:", err);
      alert("Error fetching properties");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/viewproperties?id=${propertyId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Filter Properties</h1>
        <div className="flex flex-col space-y-4">
          {[
            { label: "City", name: "city", type: "text" },
            { label: "Locality", name: "locality", type: "text" },
            { label: "Min Price", name: "minPrice", type: "number" },
            { label: "Max Price", name: "maxPrice", type: "number" },
            { label: "Property Type", name: "propertyType", type: "select", options: ["house", "apartment", "plot", "builderFloor", "cooperativeSociety"] },
            { label: "Option", name: "option", type: "select", options: ["sell", "rent"] },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor={field.name}>
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={filterData[field.name as keyof FilterData] as string}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                >
                  {field.options!.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={filterData[field.name as keyof FilterData] as string | number}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md mt-6">
        <h1 className="text-2xl font-bold mb-4">Properties</h1>
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property.id} className="mb-4">
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
              <h2 className="text-xl font-bold mb-2">{property.title}</h2>
              <p className="text-gray-700 mb-2"><strong>Owner:</strong> {property.ownerName}</p>
              <p className="text-gray-700 mb-2"><strong>Price:</strong> Rs {property.price}</p>
              <span 
                onClick={() => handlePropertyClick(property.id)} 
                className="text-blue-500 cursor-pointer"
              >
                View Details
              </span>
            </div>
          ))
        ) : (
          <p>No properties found</p>
        )}
      </div>
    </main>
  );
};

export default FilterProperties;
