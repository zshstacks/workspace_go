"use client";

import { registerUser } from "@/app/redux/slices/authSlice/asyncActions";
import {
  clearErrors,
  clearSuccess,
} from "@/app/redux/slices/authSlice/authSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import React, { useEffect, useState } from "react";
import EmailConfirmModal from "../EmailConfirmModal/EmailConfirmModal";

import { toast } from "react-toastify";
import { BsQuestion } from "react-icons/bs";

const Signup = () => {
  const [formData, setFormData] = useState({
    password: "",
    email: "",
    username: "",
  });
  const [openModal, setOpenModal] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const {
    isLoading,
    error,
    success,
    emailError,
    passwordError,
    usernameError,
  } = useSelector((state: RootState) => state.auth);

  //input logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  //submit btn logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(registerUser(formData));

    if (resultAction.meta.requestStatus === "fulfilled") {
      setOpenModal(true);
    }
  };

  //display errors and success messages
  useEffect(() => {
    [emailError, passwordError, usernameError, error].forEach((err) => {
      if (err) {
        toast.error(err, {
          theme: "dark",
          autoClose: 2000,
          onClose: () => dispatch(clearErrors()),
        });
      }
    });

    if (success) {
      toast.success(success, {
        theme: "dark",
        autoClose: 2000,
        onClose: () => dispatch(clearSuccess()),
      });
    }
  }, [emailError, passwordError, usernameError, success, error, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-bgAuth overflow-hidden">
      <div className="w-full max-w-md px-8 py-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Sign Up
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className=" text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
              Username
              <div className="relative group">
                <BsQuestion
                  className="text-gray-400 cursor-pointer "
                  size={14}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-500/20 backdrop-blur-md  text-neutral-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Char.Min: 4;
                </div>
              </div>
            </label>

            <input
              id="username"
              type="text"
              className={`w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none  ${
                usernameError
                  ? "border-red-500 transition-all ease-in-out duration-300"
                  : ""
              }`}
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
              className={`w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none   ${
                emailError
                  ? "border-red-500 transition-all ease-in-out duration-300"
                  : ""
              }`}
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className=" text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
              Password
              <div className="relative group">
                <BsQuestion
                  className="text-gray-400 cursor-pointer "
                  size={14}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-500/20 backdrop-blur-md  text-neutral-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Char.Min: 10; Min.UpperCase: 1; Min.Special.Char: 1;
                </div>
              </div>
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-4 py-2 bg-main text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                passwordError
                  ? "border-red-500 transition-all ease-in-out duration-300"
                  : ""
              }`}
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

      {openModal && <EmailConfirmModal email={formData.email} />}
    </div>
  );
};

export default Signup;
