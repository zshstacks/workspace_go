import Link from "next/link";
import React from "react";

const Signin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-bgAuth overflow-hidden">
      <div className="w-full max-w-md px-8 py-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Sign In
        </h2>
        <form className="space-y-4 ">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Create a password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              Login
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Does not have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Create One
          </Link>
        </p>
      </div>
      <span className="text-blue-300 font-bold p-10 bg-white/20">
        <Link href="/pomodoro"> Pomodoro</Link>
      </span>
    </div>
  );
};

export default Signin;
