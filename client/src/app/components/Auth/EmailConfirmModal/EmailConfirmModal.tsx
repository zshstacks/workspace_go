import React from "react";

const EmailConfirmModal = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl z-50">
      <div className="w-[90%] max-w-md bg-white/10 rounded-lg p-8 shadow-lg">
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
              className="w-10 h-12 text-center text-white text-lg bg-white/20 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
        <button className="mt-6 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md">
          Confirm
        </button>
        <button className="mt-4 w-full py-2 text-gray-400 hover:text-white font-medium rounded-md">
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmModal;
