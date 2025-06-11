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
import { useRouter, useSearchParams } from "next/navigation";
import { ImSpinner2 } from "react-icons/im";

import { IoLogoGithub } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const sessionExpired = searchParams.get("session");

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

  useEffect(() => {
    if (oauthError === "oauth") {
      toast.error("OAuth connection failed. Try again.", {
        theme: "dark",
        autoClose: 3000,
      });
    }
  }, [oauthError]);

  useEffect(() => {
    if (sessionExpired === "expired") {
      toast.warning("Your session is expired. Please login again.", {
        theme: "dark",
        autoClose: 5000,
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("session");
      window.history.replaceState({}, "", url.toString());
    }
  }, [sessionExpired]);

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
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 p-1 bg-[#09090b] border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white ${
                    errorLogin
                      ? "border-red-500 transition-all ease-in-out duration-300"
                      : ""
                  }`}
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
                  className={`w-full px-3 py-1 bg-[#09090b] border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white ${
                    errorLogin
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
                className="w-full flex items-center justify-center gap-2 py-[6px] border border-neutral-600 rounded-md hover:bg-white/25 transition text-white "
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
    </div>
  );
};

export default Signin;
