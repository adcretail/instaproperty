"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db, storage } from "@/app/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";

interface FormData {
    id?: string; // Add id here
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

const EditProperties: React.FC = () => {
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
    const [userProperties, setUserProperties] = useState<FormData[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserProperties(user.uid);
            } else {
                setUser(null);
                router.push("/Signin");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchUserProperties = async (userId: string) => {
        const q = query(collection(db, "properties"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const properties: FormData[] = [];
        querySnapshot.forEach((doc) => {
            properties.push({ id: doc.id, ...doc.data() } as FormData);
        });
        setUserProperties(properties);
    };

    const fetchPropertyDetails = async (propertyId: string) => {
        const docRef = doc(db, "properties", propertyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setFormData({ id: propertyId, ...docSnap.data() } as FormData);
            setSelectedPropertyId(propertyId);
        } else {
            console.log("No such document!");
        }
    };

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
                uploadedImageUrls.push(imageUrl);
            }
            setFormData((prevFormData) => ({
                ...prevFormData,
                images: [...prevFormData.images, ...uploadedImageUrls],
            }));
            setIsUploading(false);
        }
    };

    const handleImageRemove = async (imageUrl: string) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        setFormData((prevFormData) => ({
            ...prevFormData,
            images: prevFormData.images.filter((img) => img !== imageUrl),
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !selectedPropertyId) {
            alert("You need to be logged in to edit a property");
            return;
        }
        if (isUploading) {
            alert("Please wait for the image upload to complete");
            return;
        }
    
        try {
            const propertyData = {
                ...formData,
                floor: parseInt(formData.floor.toString(), 10),
                price: parseInt(formData.price.toString(), 10),
                areaSqft: parseInt(formData.areaSqft.toString(), 10),
                userId: user.uid,
            };
    
            const docRef = doc(db, "properties", selectedPropertyId);
            await updateDoc(docRef, propertyData);
    
            const response = await fetch(`/api/properties/update/${selectedPropertyId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(propertyData),
            });
    
            if (response.ok) {
                alert("Property updated successfully in MySQL!");
                router.push("/");
            } else {
                const errorData = await response.json();
                console.error("Error updating property in MySQL:", errorData);
                alert("Error updating property");
            }
    
            alert("Property updated successfully!");
            fetchUserProperties(user.uid); // Refresh properties list
        } catch (err) {
            console.error("Error updating property:", err);
            alert("Error updating property");
        }
    };
    
    const handleDelete = async (propertyId: string) => {
        if (!user) {
            alert("You need to be logged in to delete a property");
            return;
        }

        try {
            const docRef = doc(db, "properties", propertyId);
            await deleteDoc(docRef);

            const response = await fetch(`/api/properties/delete/${propertyId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Property deleted successfully from MySQL!");
                fetchUserProperties(user.uid); // Refresh properties list
            } else {
                const errorData = await response.json();
                console.error("Error deleting property from MySQL:", errorData);
                alert("Error deleting property");
            }
        } catch (err) {
            console.error("Error deleting property:", err);
            alert("Error deleting property");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
            {selectedPropertyId ? (
                <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
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
                                <label className="block text-gray-700 font-medium mb-2" htmlFor={field.name}>
                                    {field.label}
                                </label>
                                {field.type === "select" ? (
                                    <select
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name as keyof FormData] as string}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                    >
                                        {field.options!.map((option, index) => (
                                            <option key={index} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === "textarea" ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                        value={formData[field.name as keyof FormData] as string}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                        value={formData[field.name as keyof FormData] as string | number}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        ))}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="images">
                                Upload Images
                            </label>
                            <input
                                type="file"
                                id="images"
                                name="images"
                                accept="image/*"
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                onChange={handleImageUpload}
                                multiple
                            />
                        </div>

                        <div>
                            {formData.images.map((imageUrl, index) => (
                                <div key={index} className="mt-2 relative">
                                    <Image
                                        src={imageUrl}
                                        alt={`Uploaded image ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className="rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(imageUrl)}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded mt-4"
                        >
                            Update Property
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-wrap justify-center">
                    {userProperties.map((property) => (
                        <div key={property.id} className="max-w-sm w-full lg:max-w-full lg:flex m-4">
                            <div className="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                                <div className="mb-8">
                                    <div className="text-gray-900 font-bold text-xl mb-2">{property.title}</div>
                                    <p className="text-gray-700 text-base">{property.content}</p>
                                </div>
                                <div className="flex items-center">
                                    {property.images.map((imageUrl, index) => (
                                        <Image
                                            key={index}
                                            src={imageUrl}
                                            alt={`Property image ${index + 1}`}
                                            width={50}
                                            height={50}
                                            className="rounded mr-2"
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={() => fetchPropertyDetails(property.id!)}
                                        className="bg-yellow-500 text-white p-2 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(property.id!)}
                                        className="bg-red-500 text-white p-2 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default EditProperties;
