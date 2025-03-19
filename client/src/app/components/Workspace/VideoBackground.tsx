import React, { memo } from "react";

const VideoBackground = memo(() => {
  return (
    <div className="fixed inset-0  overflow-hidden">
      {/* <VideoBackground /> */}
      <div className="w-[100vw] h-[100vh]">
        <iframe
          src="https://www.youtube.com/embed/8plwv25NYRo?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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

// https://www.youtube.com/embed/8plwv25NYRo?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1
// https://www.youtube.com/embed/29faxSAZXrc?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1
