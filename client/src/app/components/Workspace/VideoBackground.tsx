import React, { memo, useContext } from "react";
import { MyContext } from "./Workspace";

const VideoBackground = memo(() => {
  const context = useContext(MyContext);
  if (!context) return null;
  const { videoId } = context;

  return (
    <div className="fixed inset-0  overflow-hidden">
      {/* <VideoBackground /> */}
      <div className="w-[100vw] h-[100vh] ">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
          allow="autoplay;"
          title="Background Video"
          allowFullScreen
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute top-[50%] left-[50%] w-[100vw] !h-[86vw]  pointer-events-none"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
});

VideoBackground.displayName = "VideoBackground";

export default VideoBackground;
