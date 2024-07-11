// pages/api/properties/shortlist.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      res.status(400).send({ message: 'User ID and Property ID are required' });
      return;
    }

    try {
      const shortlist = await prisma.shortlist.create({
        data: {
          userId,
          propertyId,
          isShortlisted: true,
        },
      });

      res.status(200).json({ message: 'Property shortlisted successfully', shortlist });
    } catch (error) {
      console.error('Error shortlisting property:', error);
      res.status(500).json({ message: 'Error shortlisting property', error });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).send({ message: 'User ID is required' });
      return;
    }

    try {
      const shortlists = await prisma.shortlist.findMany({
        where: { userId },
        include: { property: true },
      });

      res.status(200).json({ shortlistedProperties: shortlists });
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
      res.status(500).json({ message: 'Error fetching shortlisted properties', error });
    }
  } else {
    res.status(405).send({ message: 'Only POST and GET requests allowed' });
  }
}
