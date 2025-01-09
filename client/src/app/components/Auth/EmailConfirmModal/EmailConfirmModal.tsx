import {
  emailConfirmation,
  resendConfirmation,
} from "@/app/redux/slices/authSlice/asyncActions";
import {
  clearEmailConf,
  clearResentConf,
} from "@/app/redux/slices/authSlice/authSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { EmailModalProps } from "@/app/utility/types/types";

import "animate.css";
import { AiOutlineCheck } from "react-icons/ai";
import { toast } from "react-toastify";

const EmailConfirmModal: React.FC<EmailModalProps> = ({ email }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const dispatch: AppDispatch = useDispatch();

  const { successCodeEmail, isLoading, errorCodeEmail, error, successResent } =
    useSelector((state: RootState) => state.auth);

  const router = useRouter();

  //input fields logic
  const handleInputChange = (value: string, index: number) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  //ctrl+c ctrl+v logic
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      setCode(pasteData.split(""));
      e.preventDefault();
    }
  };

  //submit code
  const handleSubmit = async () => {
    const joinedCode = code.join("");
    const resultAction = await dispatch(
      emailConfirmation({ code: joinedCode })
    );

    if (resultAction.meta.requestStatus === "fulfilled") {
      setEmailConfirmed(true);
      toast.success(successCodeEmail, {
        theme: "dark",
        autoClose: 2000,
        onClose: () => dispatch(clearEmailConf()),
      });

      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    }
  };
  //resend code with 60 sec timeout after resend is triggered
  const handleResendCode = async () => {
    if (timer === null) {
      await dispatch(resendConfirmation({ email }));

      setTimer(60);
    }
  };

  //timer logic
  useEffect(() => {
    if (timer !== null) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  //display success messsage
  useEffect(() => {
    if (successResent) {
      toast.success(successResent, {
        theme: "dark",
        autoClose: 2000,
      });
      dispatch(clearResentConf());
    }
  }, [successResent, dispatch]);

  //display error messsage
  useEffect(() => {
    if (errorCodeEmail)
      toast.error(error, {
        theme: "dark",
        autoClose: 2000,
        onClose: () => dispatch(clearEmailConf()),
      });
  }, [error, dispatch, errorCodeEmail]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl z-50">
      <div className="w-[90%] max-w-md bg-white/10 rounded-lg p-8 shadow-lg animate__animated animate__fadeIn">
        {emailConfirmed ? (
          <div className="flex justify-center animate__animated animate__slow animate__fadeIn">
            <AiOutlineCheck color="green" size={323} />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Email Confirmation
            </h2>
            <p className="text-sm text-gray-300 text-center mb-6">
              Enter the 6-digit code sent to your email.
            </p>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onPaste={handlePaste}
                  className={`w-10 h-12 text-center text-white text-lg bg-white/20 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error
                      ? "border-red-500 transition-all ease-in-out duration-300 animate__animated animate__headShake"
                      : ""
                  }`}
                />
              ))}
            </div>
            <button
              className="mt-6 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:bg-gray-500"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Confirm
            </button>
            <button
              className="mt-4 w-full py-2 text-gray-400 hover:text-white font-medium rounded-md"
              onClick={handleResendCode}
              disabled={timer !== null}
            >
              {timer !== null ? `Resend in ${timer}s` : "Resend Code"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmModal;
