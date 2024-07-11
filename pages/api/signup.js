// pages/api/signup.js

import prisma from '../../lib/prismaClient';
import bcryptjs from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, fullName, email, mobile, password } = req.body;

    try {
      // Check if the email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash the password using bcrypt
      const hashedPassword = await bcryptjs.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          id,
          fullName,
          email,
          mobile,
          password: hashedPassword,
        },
      });

      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
