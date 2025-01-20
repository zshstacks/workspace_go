import { logoutUser } from "@/app/redux/slices/authSlice/asyncActions";
import { clearLogout } from "@/app/redux/slices/authSlice/authSlice";
import {
  changeUsername,
  deleteUser,
  validateUser,
} from "@/app/redux/slices/userSlice/asyncActions";
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
  const [newUsername, setNewUsername] = useState("");

  const dispatch: AppDispatch = useDispatch();

  const { successLogout } = useSelector((state: RootState) => state.auth);
  const { user, successDelete, username } = useSelector(
    (state: RootState) => state.user
  );

  const router = useRouter();

  const handleChangeUsername = async () => {
    if (newUsername.trim()) await dispatch(changeUsername(newUsername));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleChangeUsername();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsLoggedOut(true);
  };

  const handleDelete = () => {
    dispatch(deleteUser());
  };

  useEffect(() => {
    dispatch(validateUser());
  }, [dispatch]);

  useEffect(() => {
    if ((successLogout && isLoggedOut) || successDelete) {
      setTimeout(() => {
        dispatch(clearLogout());
        router.push("/signin");
      }, 1000);
    }
  }, [successLogout, dispatch, router, isLoggedOut, successDelete]);

  useEffect(() => {
    if (user) setNewUsername(user.username);
  }, [user]);

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
                  readOnly
                  value={user ? user.email : "Failed to fetch"}
                  className="w-full bg-main text-gray-300 text-sm rounded-md px-3 py-2 border border-gray-500 focus:outline-none "
                />
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm font-medium mb-1 block">
                  Username:
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-main text-gray-300 text-sm rounded-md px-3 py-2 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                <button
                  className="text-red-500 text-sm hover:underline"
                  onClick={handleDelete}
                >
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
