import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const { id } = req.query;
    const {
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
    } = req.body;

    try {
        const updatedProperty = await prisma.property.update({
            where: { id: String(id) },
            data: {
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
                updatedAt: new Date(),
            },
        });

        res.status(200).json({ message: 'Property updated successfully', updatedProperty });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Error updating property', error });
    }
}
