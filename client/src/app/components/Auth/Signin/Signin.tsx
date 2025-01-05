"use client";

import { loginUser } from "@/app/redux/slices/authSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch: AppDispatch = useDispatch();

  const { success } = useSelector((state: RootState) => state.auth);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        dispatch(loginUser({ email, password })).unwrap();
      } catch (error) {
        console.error("Login Failed: ", error);
      }
    },
    [dispatch, email, password]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-bgAuth overflow-hidden">
      <div className="w-full max-w-md px-8 py-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Sign In
        </h2>
        {success && <p className="text-green-300">{success}</p>}
        <form className="space-y-4 " onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
      <span className="text-blue-300 font-bold  bg-white/20">
        <Link href="/pomodoro" className="p-10 flex">
          Pomodoro
        </Link>
      </span>
    </div>
  );
};

export default Signin;
