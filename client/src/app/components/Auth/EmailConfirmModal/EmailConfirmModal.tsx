import { emailConfirmation } from "@/app/redux/slices/authSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { clearEmailConf } from "@/app/redux/slices/authSlice/authSlice";
import "animate.css";
import { AiOutlineCheck } from "react-icons/ai";

const EmailConfirmModal = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const { successCodeEmail, isLoading, errorCodeEmail, error } = useSelector(
    (state: RootState) => state.auth
  );

  const router = useRouter();

  const handleInputChange = (value: string, index: number) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      setCode(pasteData.split(""));
      e.preventDefault();
    }
  };

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
                      ? "border-red-500 transition-all ease-in-out duration-300"
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
            <button className="mt-4 w-full py-2 text-gray-400 hover:text-white font-medium rounded-md">
              Resend Code
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmModal;
