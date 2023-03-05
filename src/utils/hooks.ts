import { type RefObject, useCallback, useEffect, useState } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowDimensions(getWindowDimensions());

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export function useOutsideEvent<
  T extends { contains: (target: EventTarget | null) => boolean }
>(ref: RefObject<T>, onOutside: () => void) {
  const handler = useCallback(onOutside, [onOutside]);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target)) {
        handler();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}
