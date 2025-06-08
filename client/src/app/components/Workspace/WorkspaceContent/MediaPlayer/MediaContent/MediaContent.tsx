import { MediaContentProps } from "@/app/utility/types/componentTypes";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

const MediaContent: React.FC<MediaContentProps> = React.memo(
  ({ youtubeUrl }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previousVideoId = useRef<string | null>(null);

    const getYoutubeId = useCallback((url: string): string | null => {
      const match = url.match(
        /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([A-Za-z0-9_-]{11})/
      );
      return match ? match[1] : null;
    }, []);

    const videoId = useMemo(
      () => getYoutubeId(youtubeUrl),
      [youtubeUrl, getYoutubeId]
    );

    //prevent unnecessary iframe reloads
    const shouldUpdateIframe = useMemo(() => {
      const hasChanged = previousVideoId.current !== videoId;
      if (hasChanged) {
        previousVideoId.current = videoId;
      }
      return hasChanged;
    }, [videoId]);

    // enhanced iframe src with performance parameters
    const iframeSrc = useMemo(() => {
      if (!videoId) return "";

      const params = new URLSearchParams({
        autoplay: "0",
        modestbranding: "1",
        rel: "0",
        showinfo: "0",
        controls: "1",
        disablekb: "0",
        fs: "1",
        playsinline: "1",
        // performance optimizations
        origin: window.location.origin || "",
        enablejsapi: "1",
      });

      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }, [videoId]);

    // handle iframe load errors
    const handleIframeError = useCallback(
      (e: React.SyntheticEvent<HTMLIFrameElement>) => {
        console.warn("YouTube iframe failed to load:", e);
      },
      []
    );

    // const handleIframeLoad = useCallback(() => {
    //   // Iframe successfully loaded
    //   if (iframeRef.current) {

    //   }
    // }, []);

    // Cleanup on unmount or video change
    // useEffect(() => {
    //   return () => {
    //     if (iframeRef.current) {
    //     }
    //   };
    // }, [videoId]);

    if (!videoId) return null;

    return (
      <div className=" relative overflow-hidden  h-full w-full flex ">
        {/* <VideoBackground /> */}
        <div className="flex-grow-[100] ">
          <div className="flex flex-col  items-center h-full w-full ">
            {shouldUpdateIframe ? (
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="YouTube Video Player"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                // onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                  // improve performance
                  willChange: "transform",
                }}
              />
            ) : (
              // keep existing iframe if video hasnt changed
              iframeRef.current && (
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="YouTube Video Player"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  // onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  style={{
                    height: "100%",
                    width: "100%",
                    border: "none",
                    willChange: "transform",
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }
);

MediaContent.displayName = "MediaContent";

export default MediaContent;
