import React, { useContext } from "react";
import { IoIosClose } from "react-icons/io";
import { MyContext } from "../../Workspace/Workspace";
import { BackgroundSelectProps } from "@/app/utility/types/componentTypes";
import Image from "next/image";

const BackgroundSelect: React.FC<BackgroundSelectProps> = ({
  setOpenBackgroundSelect,
}) => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The BackgroundSelect component should be used within MyContext.Provider."
    );
  }

  const { theme, setVideoId } = context;

  const options = [
    {
      id: "8plwv25NYRo",
      label: "Forest Rain",
      preview: process.env.NEXT_PUBLIC_FOREST_PREVIEW as string,
    },
    {
      id: "29faxSAZXrc",
      label: "Tokyo Rainy Night",
      preview: process.env.NEXT_PUBLIC_TOKYO_PREVIEW as string,
    },
    {
      id: "l4UBqr3Z6r8",
      label: "Swiss village",
      preview: process.env.NEXT_PUBLIC_SWISS_PREVIEW as string,
    },
    {
      id: "Ii9fO5Y7SVo",
      label: "Space",
      preview: process.env.NEXT_PUBLIC_SPACE_PREVIEW as string,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
        <div className="w-[400px] bg-main dark:bg-lightMain rounded-lg shadow-lg ">
          {/* Close Icon */}
          <div className="flex relative justify-end">
            <button
              className="m-1 cursor-pointer"
              onClick={setOpenBackgroundSelect}
            >
              <IoIosClose
                color={theme === "dark" ? "#4e4e4e" : "white"}
                size={22}
              />
            </button>
          </div>

          <div className="p-6">
            {/* Header */}
            <h2 className="text-white dark:text-lightText text-xl font-semibold mb-6">
              Video Backgrounds
            </h2>

            {/* content */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-white/90 dark:text-lightText">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="grid"
                  onClick={() => {
                    setVideoId(opt.id);
                  }}
                >
                  <Image
                    src={opt.preview}
                    className="rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                    width={500}
                    height={500}
                    alt={opt.label}
                  />
                  <span className="text-center text-sm mt-2">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundSelect;
