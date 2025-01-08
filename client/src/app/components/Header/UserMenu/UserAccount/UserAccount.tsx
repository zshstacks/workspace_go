import { logoutUser } from "@/app/redux/slices/authSlice/asyncActions";
import { clearLogout } from "@/app/redux/slices/authSlice/authSlice";
import { validateUser } from "@/app/redux/slices/userSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import { UserAccountProps } from "@/app/utility/types/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

const UserAccount: React.FC<UserAccountProps> = ({
  openAccSettings,
  setOpenAccSettings,
}) => {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const { successLogout } = useSelector((state: RootState) => state.auth);
  const { user } = useSelector((state: RootState) => state.user);

  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsLoggedOut(true);
  };

  useEffect(() => {
    dispatch(validateUser());
  }, [dispatch]);

  useEffect(() => {
    if (successLogout && isLoggedOut) {
      setTimeout(() => {
        dispatch(clearLogout());
        router.push("/signin");
      }, 1000);
    }
  }, [successLogout, dispatch, router, isLoggedOut]);

  return (
    <>
      {openAccSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
          <div className="w-[400px] bg-main rounded-lg shadow-lg ">
            {/* Close Icon */}
            <div className="flex relative justify-end">
              <button
                className="m-1 cursor-pointer"
                onClick={setOpenAccSettings}
              >
                <IoIosClose color="white" size={22} />
              </button>
            </div>

            <div className="p-6">
              {/* Header */}
              <h2 className="text-white text-xl font-semibold mb-6">
                My account
              </h2>

              {/* Email */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm font-medium mb-1 block">
                  Email:
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full bg-main text-gray-300 text-sm rounded-md px-3 py-2 border border-gray-500  focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm font-medium mb-1 block">
                  Username:
                </label>
                <input
                  type="text"
                  value={user.username}
                  className="w-full bg-main text-gray-300 text-sm rounded-md px-3 py-2 border border-gray-500 focus:outline-none"
                />
              </div>

              {/* Logout */}
              <div className="mt-5 mb-4 flex gap-2">
                <button className="text-gray-500" onClick={handleLogout}>
                  Log out
                </button>
                {isLoggedOut ? (
                  <span className=" text-green-500 text-sm  m-auto">
                    {successLogout}
                  </span>
                ) : (
                  ""
                )}
              </div>

              {/* Delete Account */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-xs mb-2">
                  Permanently delete your pomodoro_go account and all of your
                  data.
                </p>
                <button className="text-red-500 text-sm hover:underline">
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAccount;
