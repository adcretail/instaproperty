import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    id,
    title,
    content,
    city,
    area,
    locality,
    floor,
    propertyType,
    transactionType,
    option,
    price,
    areaSqft,
    ownerName,
    contactNumber,
    facingDirection,
    status,
    userId,
  } = req.body;

  if (!title || !content || !city || !area || !locality || !floor || !propertyType || !transactionType || !option || !price || !areaSqft || !ownerName || !contactNumber || !facingDirection || !status || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const property = await prisma.property.create({
      data: {
        id,
        title,
        content,
        city,
        area,
        locality,
        floor: parseInt(floor, 10),
        propertyType,
        transactionType,
        option,
        price: parseInt(price, 10),
        areaSqft: parseInt(areaSqft, 10),
        ownerName,
        contactNumber,
        facingDirection,
        status,
        userId,
      },
    });

    return res.status(200).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
