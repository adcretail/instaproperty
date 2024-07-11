"use client";
import React from 'react';
import Head from 'next/head';

const VerifyEmail = () => {
  return (
    <div className="flex justify-center p-4">
      <Head>
        <title>Verify Email</title>
      </Head>
      <div className="w-full max-w-md p-4 bg-white rounded shadow md:px-24 md:py-8 sm:p-10 lg:p-12 xl:p-14">
        <p className="text-xl font-bold mb-4">Verify Your Email</p>
        <p className="text-gray-600">
          A verification link has been sent to your email address. Please check your inbox and click the link to verify your email.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
