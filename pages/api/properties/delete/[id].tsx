import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.status(405).send({ message: 'Only DELETE requests allowed' });
        return;
    }

    const { id } = req.query;

    try {
        const deletedProperty = await prisma.property.delete({
            where: { id: String(id) },
        });

        res.status(200).json({ message: 'Property deleted successfully', deletedProperty });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property', error });
    }
}
