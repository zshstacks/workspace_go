import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "./Workspace";

const VideoBackground = memo(() => {
  const context = useContext(MyContext)!; //! means that context never will be null
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoSize, setVideoSize] = useState({
    width: "100%",
    height: "86.25vw",
  });

  const { videoId } = context;

  const calculateVideoSize = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const aspectRatio = 16 / 9;

    const widthBaseHeight = viewportWidth / aspectRatio;
    // const heightBaseWidth = viewportHeight * aspectRatio;

    if (widthBaseHeight >= viewportHeight) {
      setVideoSize({ width: "100%", height: "86.25vw" });
    } else {
      setVideoSize({ width: "177.78vh", height: "120%" });
    }
  };

  //cleanup iframe
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = "about:blank";
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (iframeRef.current) {
        const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`;
        iframeRef.current.src = src;
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [videoId]);

  useEffect(() => {
    calculateVideoSize();

    const handleResize = () => {
      calculateVideoSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0  overflow-hidden">
      {/* VideoBackground  */}
      <div className="w-[100vw] h-[100vh] ">
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&start=7&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title="Background Video"
            allowFullScreen
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="fixed top-[50%] left-[50%]   pointer-events-none border-0"
            style={{
              transform: "translate(-50%, -50%)",
              aspectRatio: "16/9",
              height: videoSize.height,
              width: videoSize.width,
              msOverflowStyle: "none",
              overflow: "hidden",
            }}
          />
        </div>
      </div>
    </div>
  );
});

VideoBackground.displayName = "VideoBackground";

export default VideoBackground;
