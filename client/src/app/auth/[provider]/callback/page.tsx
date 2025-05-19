"use client";

import { oauthLogin } from "@/app/redux/slices/authSlice/asyncActions";
import { clearLoginErrors } from "@/app/redux/slices/authSlice/authSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useSearchParams, useRouter, useParams } from "next/navigation";

import { useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const OAuthCallback = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as "github" | "google";
  const code = searchParams.get("code") || "";
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { isLoading, errorLogin, successLogin, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (code && provider) {
      (async () => {
        try {
          await dispatch(oauthLogin({ provider, code })).unwrap();
        } catch (error) {
          console.error("OAuth login failed: ", error);
        }
      })();
    } else {
      router.replace("/signin");
    }
  }, [code, provider, dispatch, router]);

  useEffect(() => {
    if (errorLogin) {
      toast.error(errorLogin, {
        theme: "dark",
        autoClose: 3000,
        onClose: () => dispatch(clearLoginErrors()),
      });
      router.replace("/signin?error=oauth");
    }

    if (successLogin && user) {
      toast.success(successLogin, {
        theme: "dark",
        autoClose: 2000,
      });
      router.push("/workspace");
    }
  }, [errorLogin, successLogin, user, dispatch, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#09090b]">
      <ImSpinner2 className="animate-spin text-white text-4xl mb-4" />
      <p className="text-white">
        {isLoading ? `Authentification with ${provider}...` : "Redirecting..."}
      </p>
    </div>
  );
};

export default OAuthCallback;
