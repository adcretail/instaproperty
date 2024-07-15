"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/app/firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, updateMetadata } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import Head from "next/head";
import Image from "next/image";

interface FormData {
  title: string;
  content: string;
  images: string[];
  city: string;
  area: string;
  locality: string;
  floor: number;
  propertyType: string;
  transactionType: string;
  option: string;
  price: number;
  areaSqft: number;
  ownerName: string;
  contactNumber: string;
  facingDirection: string;
  status: string;
}

const PostProperties: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    images: [],
    city: "",
    area: "",
    locality: "",
    floor: 0,
    propertyType: "house",
    transactionType: "leaseHold",
    option: "sell",
    price: 0,
    areaSqft: 0,
    ownerName: "",
    contactNumber: "",
    facingDirection: "north",
    status: "readyToMove",
  });
  const [user, setUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && user) {
      setIsUploading(true);
      const uploadedImageUrls: string[] = [];
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `properties/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        await updateMetadata(storageRef, {
          customMetadata: {
            userId: user.uid,
          },
        });

        uploadedImageUrls.push(imageUrl);
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, ...uploadedImageUrls],
      }));
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You need to be logged in to post a property");
      return;
    }
    if (isUploading) {
      alert("Please wait for the image upload to complete");
      return;
    }

    try {
      const propertyData = {
        ...formData,
        userId: user.uid,
      };
      const docRef = await addDoc(collection(db, "properties"), propertyData);
      const firebaseId = docRef.id;

      console.log("Document written with ID: ", firebaseId);

      const response = await fetch("/api/properties/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...propertyData, id: firebaseId }),
      });

      if (response.ok) {
        alert("Property added successfully!");
        router.push("/");
      } else {
        const errorData = await response.json();
        console.error("Error adding property to MySQL:", errorData);
        alert("Error adding property");
      }
    } catch (err) {
      console.error("Error posting property:", err);
      alert("Error posting property");
    }
  };

  return (
    <>
      <Head>
        <title>Post Property - Add Your Real Estate Listing</title>
        <meta
          name="description"
          content="Post your property listing to reach potential buyers and renters. Upload images, provide details, and manage your real estate properties easily."
        />
        <meta
          name="keywords"
          content="post property, add real estate listing, upload property images, real estate management, property for sale, property for rent"
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-black">Post Property</h1>
          <div className="flex flex-col space-y-4">
            {[
              { label: "Title", name: "title", type: "text" },
              { label: "Content", name: "content", type: "textarea" },
              { label: "City", name: "city", type: "text" },
              { label: "Area", name: "area", type: "text" },
              { label: "Locality", name: "locality", type: "text" },
              { label: "Floor", name: "floor", type: "number" },
              { label: "Property Type", name: "propertyType", type: "select", options: ["house", "apartment", "plot", "builderFloor", "cooperativeSociety"] },
              { label: "Transaction Type", name: "transactionType", type: "select", options: ["leaseHold", "freeHold"] },
              { label: "Option", name: "option", type: "select", options: ["sell", "rent", "pg"] },
              { label: "Price", name: "price", type: "number" },
              { label: "Area (sq ft)", name: "areaSqft", type: "number" },
              { label: "Owner Name", name: "ownerName", type: "text" },
              { label: "Contact Number", name: "contactNumber", type: "text" },
              { label: "Facing Direction", name: "facingDirection", type: "select", options: ["north", "south", "east", "west"] },
              { label: "Status", name: "status", type: "select", options: ["readyToMove", "underConstruction"] },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-black font-bold mb-2" htmlFor={field.name}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof FormData] as string}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded mt-1 font-bold text-black"
                  >
                    {field.options!.map((option, index) => (
                      <option key={index} value={option} className="font-bold text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full p-2 border border-gray-300 rounded mt-1 font-bold text-black"
                    value={formData[field.name as keyof FormData] as string}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full p-2 border border-gray-300 rounded mt-1 font-bold text-black"
                    value={formData[field.name as keyof FormData] as string | number}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="block text-black font-bold mb-2" htmlFor="images">
                Upload Images
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded mt-1 font-bold text-black"
                onChange={handleImageUpload}
                multiple
              />
            </div>

            <div>
              {formData.images.map((imageUrl, index) => (
                <div key={index} className="mt-2">
                  <Image
                    src={imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded mt-4 font-bold"
            >
              Post Property
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default PostProperties;
