import Link from "next/link";
import React from "react";

const StartPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      {/* Space-themed background */}
      <div className="absolute inset-0  bg-cover bg-center bg-bgAuth opacity-60 blur-md"></div>

      {/* Content Section */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center max-w-md">
        <h1 className="text-4xl text-white font-bold">workspace_go</h1>
        <p className="text-gray-300 mt-4">
          Boost your productivity by focusing on what matters. Get started with
          workspace_go today.
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Link href="/signin"> Create workspace</Link>
        </button>
      </div>
    </div>
  );
};

export default StartPage;
