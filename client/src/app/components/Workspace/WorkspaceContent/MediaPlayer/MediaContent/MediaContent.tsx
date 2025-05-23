import { MediaContentProps } from "@/app/utility/types/componentTypes";
import React from "react";

const MediaContent: React.FC<MediaContentProps> = ({ youtubeUrl }) => {
  const getYoutubeId = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([A-Za-z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const videoId = getYoutubeId(youtubeUrl);
  const src = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

  return (
    <div className=" relative overflow-hidden  h-full w-full flex ">
      {/* <VideoBackground /> */}
      <div className="flex-grow-[100] ">
        <div className="flex flex-col  items-center h-full w-full ">
          <iframe
            src={src}
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
