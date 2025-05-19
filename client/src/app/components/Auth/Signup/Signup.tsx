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
import { IoLogoGithub } from "react-icons/io";
import { ImSpinner2 } from "react-icons/im";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

const Signup = () => {
  const [formData, setFormData] = useState({
    password: "",
    email: "",
    username: "",
  });
  const [openModal, setOpenModal] = useState(false);

  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

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

  useEffect(() => {
    if (oauthError === "oauth") {
      toast.error("OAuth connection failed. Try again.", {
        theme: "dark",
        autoClose: 3000,
      });
    }
  }, [oauthError]);

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

  const handleOAuth = (provider: "github" | "google") => {
    const callbackUrl = `${window.location.origin}/auth/${provider}/callback`;
    const encodedCallback = encodeURIComponent(callbackUrl);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}/login?callback=${encodedCallback}`;
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#09090b] gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 ">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm  backdrop-blur-md rounded-xl p-8 shadow-white/35 shadow-inner bg-[#09090b] ">
            <h1 className="text-2xl font-bold text-white text-center">
              Sign Up
            </h1>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your credentials to create your account
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="text-sm text-white flex items-center gap-1"
                >
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
                  placeholder="Enter your username"
                  required
                  onChange={handleChange}
                  className={`w-full px-3 p-1 bg-[#09090b] border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white ${
                    usernameError
                      ? "border-red-500 transition-all ease-in-out duration-300"
                      : ""
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm text-white ">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  onChange={handleChange}
                  className={`w-full px-3 p-1 bg-[#09090b] border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white ${
                    emailError
                      ? "border-red-500 transition-all ease-in-out duration-300"
                      : ""
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <label
                    htmlFor="password"
                    className="text-sm text-white flex items-center gap-1"
                  >
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
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  onChange={handleChange}
                  className={`w-full px-3 py-1 bg-[#09090b] border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white ${
                    passwordError
                      ? "border-red-500 transition-all ease-in-out duration-300"
                      : ""
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-1 rounded-md bg-white text-black font-medium hover:bg-gray-100 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <ImSpinner2 className="animate-spin" />
                ) : (
                  "Register"
                )}
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-600" />
                <span className="px-2 text-sm text-gray-400">
                  Or continue with
                </span>
                <hr className="flex-grow border-gray-600" />
              </div>

              <button
                type="button"
                className="w-full flex items-center  justify-center gap-2 py-[6px] border border-neutral-600 rounded-md hover:bg-white/25 transition text-white "
                onClick={() => handleOAuth("github")}
              >
                <IoLogoGithub size={18} />
                <span className="text-sm font-semibold">Login with GitHub</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-[6px] border border-neutral-600 rounded-md hover:bg-white/25 transition text-white "
                onClick={() => handleOAuth("google")}
              >
                <FcGoogle size={18} />
                <span className="text-sm font-semibold">Login with Google</span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="underline underline-offset-2 text-white hover:text-gray-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      {openModal && <EmailConfirmModal email={formData.email} />}
    </div>
  );
};

export default Signup;
