import React from "react";

const MediaContent = () => {
  return (
    <div className=" relative overflow-hidden  h-full w-full flex ">
      {/* <VideoBackground /> */}
      <div className="flex-grow-[100] ">
        <div className="flex flex-col  items-center h-full w-full ">
          <iframe
            src={`https://www.youtube.com/embed/uJqGbdVt0bM`}
            allow="autoplay;"
            title="Background Video"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className=" "
            style={{ height: "inherit", width: "inherit" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaContent;
