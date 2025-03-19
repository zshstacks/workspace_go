import { UserStatsProps } from "@/app/utility/types/componentTypes";
import React, { useContext, useEffect } from "react";
import { MyContext } from "../../Workspace/Workspace";
import { IoIosClose } from "react-icons/io";
import { BsFire } from "react-icons/bs";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllStats,
  updateDailyStreak,
} from "@/app/redux/slices/statsSlice/asyncActions";

const UserStats: React.FC<UserStatsProps> = ({
  openUserStats,
  setOpenUserStats,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const stats = useSelector((state: RootState) => state.stats);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The UserStats component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  const handleCloseStats = () => {
    setOpenUserStats(false);
  };

  useEffect(() => {
    dispatch(updateDailyStreak())
      .unwrap()
      .catch(() => {
        dispatch(getAllStats());
      });
  }, [dispatch]);

  return (
    <>
      {openUserStats && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[9999]">
          <div className="min-w-[620px] max-h-[80%] h-fit flex flex-col justify-start overflow-y-scroll  custom-scrollbar bg-main dark:bg-white rounded-lg shadow-lg">
            {/* close btn */}
            <div className="flex justify-end relative">
              <button className="m-1 cursor-pointer" onClick={handleCloseStats}>
                <IoIosClose
                  color={theme === "dark" ? "#4e4e4e" : "white"}
                  size={22}
                />
              </button>
            </div>
            <div className="px-10">
              {/* title */}
              <div className="flex flex-row w-full">
                <h2 className="text-white dark:text-lightText text-2xl font-semibold mb-3">
                  Your stats
                </h2>
              </div>
              {/* content */}
              <div className="flex flex-col align-middle">
                {/* longest streak and hours block */}
                <div className="bg-[#3d3e42] dark:bg-neutral-100 flex justify-around w-full rounded-lg p-[15px] ">
                  <div>
                    <div className="text-center text-sm text-white dark:text-lightText mb-2">
                      Longest streak
                    </div>
                    <div className="text-center text-xl text-secondary flex justify-center gap-2">
                      <BsFire
                        color="darkorange"
                        size={19}
                        className="my-auto"
                      />
                      {stats.highestStreak}
                    </div>
                  </div>
                  {/* divider */}
                  <div className="h-[51px] w-[1px] bg-neutral-600 dark:bg-lightBorder  my-auto"></div>
                  <div>
                    <div className="text-sm text-center text-white dark:text-lightText mb-2">
                      Empty
                    </div>
                    <div className="text-secondary text-xl text-center flex justify-center gap-2">
                      Empty
                    </div>
                  </div>
                </div>
                {/* divider */}
                <div className="h-[1px] w-[90%] bg-neutral-600 dark:bg-lightBorder mx-auto my-4"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStats;
