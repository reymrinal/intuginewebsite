"use client";

import { useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { cruiseStyle } from "./_style";
import { cruiseMarkup } from "./_markup";
import { cruiseScript } from "./_script";

export default function CruisePage() {
  const scriptRanRef = useRef(false);

  useEffect(() => {
    if (scriptRanRef.current) return; // avoid double-exec in React strict mode / re-renders
    scriptRanRef.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = cruiseScript;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cruiseStyle }} />
      <div dangerouslySetInnerHTML={{ __html: cruiseMarkup }} />
      <Footer />
    </>
  );
}
