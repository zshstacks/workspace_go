"use client";

import { loginUser } from "@/app/redux/slices/authSlice/asyncActions";
import {
  clearLoginErrors,
  clearSuccessLogin,
} from "@/app/redux/slices/authSlice/authSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import React, { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ImSpinner2 } from "react-icons/im";
import Image from "next/image";
import { LuGalleryVerticalEnd } from "react-icons/lu";
import { IoLogoGithub } from "react-icons/io";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch: AppDispatch = useDispatch();

  const { successLogin, errorLogin, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const router = useRouter();

  //submit btn logic
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

  //display errors and success messages
  useEffect(() => {
    if (errorLogin) {
      toast.error(errorLogin, {
        theme: "dark",
        autoClose: 2000,
        onClose: () => dispatch(clearLoginErrors()),
      });
    }

    if (successLogin) {
      toast.success(successLogin, {
        theme: "dark",
        autoClose: 2000,
        onClose: () => dispatch(clearSuccessLogin()),
      });

      router.push("/workspace");
    }
  }, [successLogin, errorLogin, dispatch, router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kreisā puse */}
      <div className="flex flex-col bg-black p-8 md:p-16">
        <Link
          href="#"
          className="flex items-center gap-2 text-white font-medium mb-8"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LuGalleryVerticalEnd className="h-4 w-4" />
          </div>
          workspace-go
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm  backdrop-blur-md rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-white text-center">
              Login to your account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your email below to login to your account
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm text-white">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 p-1 bg-black border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <label htmlFor="password" className="text-sm text-white">
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1 bg-black border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-1 rounded-md bg-white text-black font-medium hover:bg-gray-100 transition flex items-center justify-center"
              >
                {isLoading ? <ImSpinner2 className="animate-spin" /> : "Login"}
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
              >
                <IoLogoGithub size={18} />
                <span className="text-sm font-semibold">Login with GitHub</span>
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-2 text-white hover:text-gray-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Labā puse */}
      <div className="relative hidden lg:block">
        <Image
          src={process.env.NEXT_PUBLIC_SPACE_PREVIEW as string}
          alt="Background"
          fill
          className="object-cover brightness-50 "
        />
      </div>
    </div>
  );
};

export default Signin;
