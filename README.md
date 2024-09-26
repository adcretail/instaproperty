# instaproperty
InstaProperty
Table of Contents
Overview
InstaProperty is a web application built using TypeScript and JavaScript, utilizing Firebase for user data and image storage, and Postgres DB with Prisma ORM for storing user, property details, and shortlisted properties.
Features
User registration and login
Property listing with multiple images
Property editing and deletion
Image uploading and deletion
Shortlisting properties
Contact information display for shortlisted properties
User profile management
Technology Stack
Frontend: TypeScript, JavaScript, HTML5, CSS3
Backend: Node.js, Express.js
Database: Postgres DB with Prisma ORM
Storage: Firebase Storage
Authentication: Firebase Authentication
Installation
Clone the repository: git clone https://github.com/your-username/instaproperty.git
Install dependencies: npm install or yarn install
Set up Firebase configuration (see below)
Create a Postgres DB and update schema.prisma with your DB credentials
Run npx prisma generate to generate Prisma client
Start the application: npm start or yarn start
Usage
Register as a user
Login to your account
Post properties with images
Edit property details and images
Shortlist properties
View owner contact information
Database Schema
The database schema is defined in schema.prisma:
Prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String      @id @default(uuid())
  email       String      @unique
  password    String
  properties  Property[]
  shortlists  Shortlist[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Property {
  id             String      @id @default(uuid())
  title          String
  content        String
  city           String
  area           String
  locality       String
  floor          Int
  propertyType   String
  transactionType String
  option         String
  price          Int
  areaSqft       Int
  ownerName      String
  contactNumber  String
  facingDirection String
  status         String
  userId         String
  user           User        @relation(fields: [userId], references: [id])
  shortlists     Shortlist[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model Shortlist {
  id            String     @id @default(uuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  propertyId    String
  property      Property   @relation(fields: [propertyId], references: [id])
  isShortlisted Boolean    @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
Firebase Configuration
Create a Firebase project and enable the following services:
Firebase Authentication
Firebase Storage
Update the firebaseConfig object in src/firebase/config.ts with your Firebase project settings:
TypeScript
// src/firebase/config.ts

const firebaseConfig = {
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  projectId: '<PROJECT_ID>',
  storageBucket: '<STORAGE_BUCKET>',
  appId: '<APP_ID>',
};
Contributing
Contributions are welcome! Please submit a pull request with your changes.
License
InstaProperty is licensed under the MIT License.
By using InstaProperty, you agree to the terms and conditions outlined in the LICENSE file.
