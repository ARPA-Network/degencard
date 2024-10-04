import { useEffect } from "react";

const getMobileDetect = (userAgent: NavigatorID["userAgent"]) => {
  const isAndroid = () => Boolean(userAgent.match(/Android/i));
  const isIos = () => Boolean(userAgent.match(/iPhone|iPad|iPod/i));
  const isAndroidWebView = () => /wv/.test(userAgent) || /Version\/[\d.]+/.test(userAgent);
  const isIOSWebView = () => /iPhone|iPod|iPad.*AppleWebKit(?!.*Safari)/.test(userAgent);
  const isMobile = () => Boolean(isAndroid() || isIos());
  const isWebView = () => Boolean(isAndroidWebView() || isIOSWebView())
  return {
    isMobile,
    isAndroid,
    isIos,
    isWebView,
    isAndroidWebView,
    isIOSWebView
  };
};
const useMobileDetect = () => {
  useEffect(() => {}, []);
  const userAgent =
    typeof navigator === "undefined" ? "SSR" : navigator.userAgent;  
  return getMobileDetect(userAgent);
};

export default useMobileDetect;
