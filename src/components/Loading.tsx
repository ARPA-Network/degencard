import { LoadState } from "@/utils/constants";
import { useTranslations } from "next-intl";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Img from "./Img";

/* eslint-disable @next/next/no-img-element */
export default function Loading({
  setLoadState,
  hasData,
}: {
  setLoadState: Dispatch<SetStateAction<LoadState>>;
  hasData: boolean;
}) {
  const time = 1300;
  const count = useRef<number>(time);
  const itl = useRef<NodeJS.Timeout>();
  const timeout = useRef<NodeJS.Timeout>();
  const t = useTranslations("Loading");
  const lastId = useRef(0);
  const [loadId, setLoadId] = useState(0);
  const [isError, setError] = useState(false);
  const dataState = useRef(false);

  useEffect(() => {
    return () => {
      clearInterval(itl.current);
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    dataState.current = hasData;
  }, [hasData]);

  useEffect(() => {
    itl.current = setInterval(() => {
      // console.log(count.current);
      if (count.current > 2000) {
        if (dataState.current) {
          setLoadState(LoadState.Loaded);
          clearInterval(itl.current);
        } else if (count.current > 10000) {
          setError(true);
          clearInterval(itl.current);
          timeout.current = setTimeout(() => {
            setLoadState(LoadState.Idle);
          }, 5000);
        }
      }

      const fn = () => Math.round(Math.random() * 3);
      let m = fn();
      if (m === lastId.current) {
        m = fn();
      }
      setLoadId(m);
      lastId.current = m;
      count.current += time;
    }, time);
  }, [setLoadState]);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      {isError ? (
        <div>{t("error")}</div>
      ) : (
        <>
          <div className="w-[85%] sm:w-[35rem]">
            <Img src="/bar.gif" alt="loading" height="auto" width="100%" />
            <div className="text-violet-500 text-shadow text-3xl sm:text-4xl text-center mt-6">
              {t(loadId + "")}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
