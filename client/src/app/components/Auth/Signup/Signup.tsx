"use client";

import { registerUser } from "@/app/redux/slices/authSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const Signup = () => {
  const [formData, setFormData] = useState({
    password: "",
    email: "",
    username: "",
  });

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const { isLoading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (error) {
      toast.error(error, { theme: "dark", autoClose: 3000 });
    }

    const resultAction = await dispatch(registerUser(formData));

    if (resultAction.meta.requestStatus === "fulfilled") {
      toast.success(success, {
        theme: "dark",
        autoClose: 3000,
      });
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-bgAuth overflow-hidden">
      <div className="w-full max-w-md px-8 py-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Sign Up
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>

            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Create a password"
              onChange={handleChange}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-500"
              disabled={isLoading}
            >
              Register
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-400 hover:underline">
            Sign In
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

export default Signup;
