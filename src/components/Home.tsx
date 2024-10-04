"use client";

import { useLocale, useTranslations } from "next-intl";
import { useWallet } from "@solana/wallet-adapter-react";
import { toBlob } from "html-to-image";
import { z } from "zod";
import { sign } from "tweetnacl";
import base58 from "bs58";
import { WalletButton } from "@/providers/wallet-context-provider";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import ProfileCard from "@/components/ProfileCard";
import TokenCard from "@/components/TokenCard";
import Modal from "@/components/Modal";
// import sampleData from "../sampleData.json";
import Loading from "@/components/Loading";
import SaveBtn from "@/components/SaveBtn";
import Img from "@/components/Img";
import Loader from "@/components/Loader";
import {
  isMobileDraft,
  isProd,
  isTestMobile,
  LoadState,
} from "@/utils/constants";
import useMobileDetect from "@/utils/useDeviceDetect";
import { delay } from "@/utils/helper";
import { gaSave, gaWalletConnected } from "@/utils/ga";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Home() {
  const { connected, publicKey, signMessage, disconnecting } = useWallet();
  const locale = useLocale();
  const t = useTranslations("IndexPage");
  const [loadState, setLoadState] = useState(LoadState.Idle);
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false); // modal
  const [name, setName] = useState("PEPE");
  const [avatar, setAvatar] = useState(0);
  const [motto, setMotto] = useState(0);
  const [tokenData, setTokenData] = useState<any>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const tokenCardRef = useRef<HTMLDivElement>(null);
  const [currentCard, setCurrentCard] = useState("profile"); // profile or token
  const [errors, setErrors] = useState<string[]>([]);
  const [testWallet, setTestWallet] = useState(
    "EfbbhahGNuhqEraRZXrwETfsaKxScngEttdQixWAW4WE"
  );
  const [imgblob, setImgblob] = useState<Blob | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [hasConnect, setConnect] = useState(false); // has user manually connected the wallet
  const [tabDegen, setTabDegen] = useState(true);
  const isMobile = useMobileDetect().isMobile();
  const isWebView = useMobileDetect().isWebView();
  const [s3link, setS3link] = useState("");

  const mobileDisabled = useMemo(
    () => isMobileDraft && (isMobile || isWebView || isTestMobile),
    [isMobile, isWebView]
  );

  // to fix refreshing stuck bug
  useEffect(() => {
    if (isMobile) {
      localStorage.clear();
    }
  }, [isMobile]);

  const wallet = useMemo(() => {
    if (!publicKey) return testWallet;
    return isProd ? publicKey.toBase58() : testWallet;
  }, [publicKey, testWallet]);

  useEffect(() => {
    if (disconnecting) {
      setConnect(false);
      setData(null);
      setLoadState(LoadState.Idle);
    }
  }, [disconnecting]);

  useEffect(() => {
    if (connected && hasConnect && publicKey) {
      gaWalletConnected(publicKey.toBase58());
    }
  }, [connected, hasConnect, publicKey]);

  const handleWalletChange = useCallback(
    (e: any) => setTestWallet(e.target.value),
    []
  );

  const handleGenerate = useCallback(() => {
    setLoadState(LoadState.Loading);
    if (publicKey) {
      const addr = isProd
        ? publicKey.toBase58()
        : testWallet || publicKey.toBase58();
      fetch(`/v1/profile?wallet_address=${addr}`)
        .then((res) => {
          if (res.status !== 200) throw "failed to fetch data";
          return res.json();
        })
        .then((data) => {
          // console.log(data);
          if (!testWallet) setTestWallet(publicKey.toBase58());
          setData(data);
          setName(data.name);
          setAvatar(data.avatar_id);
          setMotto(data.motto_id);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [publicKey, testWallet]);

  const onSummit = useCallback(async () => {
    // validate name
    const result = z
      .string()
      .trim()
      .min(3, { message: t("NameError.too_small") })
      .max(15, { message: t("NameError.too_big") })
      .regex(/^[\u4e00-\u9fa5A-Za-z0-9_]+$/, {
        message: t("NameError.invalid_string"),
      })
      .safeParse(name);

    if (!result.success) {
      const { errors } = result.error;
      setErrors(errors.map((m) => m.message));
      throw result.error.format();
    } else {
      if (isMobile || isTestMobile) {
        // console.log(`mobile - real: ${isMobile} | test: ${isTestMobile}`);
      }
      if (isProd) {
        // console.log("call post api");
        // post api
        if (!publicKey) throw new Error("Wallet not connected!");
        if (!signMessage)
          throw new Error("Wallet does not support message signing!");
        const message = new TextEncoder().encode(
          `${publicKey.toBase58()}${name}${avatar}${motto}`
        );
        // Sign the bytes using the wallet
        const signature = await signMessage(message);
        // console.log(base58.encode(signature));
        if (!sign.detached.verify(message, signature, publicKey.toBytes()))
          throw new Error("Invalid signature!");

        try {
          const res = await fetch("/v1/profile", {
            method: "POST",
            body: JSON.stringify({
              wallet_address: publicKey.toBase58(),
              signature: base58.encode(signature),
              name,
              avatar_id: avatar,
              motto_id: motto,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          // console.log(res);
        } catch (error) {
          throw error;
        }
      }
    }
  }, [avatar, isMobile, motto, name, publicKey, signMessage, t]);

  const genImg = useCallback(async (node: HTMLElement) => {
    // console.log("gen img...");
    try {
      // to fix blank image bug
      const fnb = async () => {
        if (!node) return null;
        return await toBlob(node, {
          includeQueryParams: true,
          cacheBust: true,
        });
      };
      const fn = async () => {
        const r1 = await fnb();
        // console.log(r1?.size);
        await delay(600);
        const r2 = await fnb();
        // console.log(r2?.size);
        await delay(600);
        const r3 = await fnb();
        // console.log(r3?.size);
        return r3;
      };
      const blob = await fn().then((res) => res);
      if (blob) {
        setImgblob(blob);
        console.log("get blob: ", blob?.size);
        return blob;
      }
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }, []);

  const uploadToS3 = useCallback(async (blob: Blob) => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: blob.type }),
      });
      if (res.ok) {
        const { url, fields } = await res.json();
        // console.log("url: ", url);
        // console.log("fields: ", fields);

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", blob);

        const uploadRes = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const link = url + fields.key;
          setS3link(link);
          console.log("Upload successful!", link);
        }
      }
    } catch (error) {
      console.error("S3 Upload Error:", error);
      throw error;
    }
  }, []);

  const handleSave = useCallback(
    async (ref: RefObject<HTMLDivElement>) => {
      if (ref.current === null || !publicKey) return;
      const cardType = ref.current.getAttribute("data-name");
      setCurrentCard(cardType || "profile");

      try {
        setSaving(true);
        await onSummit();
        const blob = await genImg(ref.current);
        if (blob && (isMobile || isWebView || isTestMobile)) {
          await uploadToS3(blob);
        }

        setSaving(false);
        setOpen(true);
        gaSave(publicKey.toBase58(), cardType);
      } catch (err:any) {
        setSaving(false);
        console.log(err.message);
      }
    },
    [genImg, isMobile, isWebView, onSummit, publicKey, uploadToS3]
  );

  return (
    <main className="relative h-full w-full">
      {loadState === LoadState.Idle ? (
        <div className="absolute flex flex-col items-center w-full h-full">
          <div className="bg-logo bg-bottom h-[45%] md:h-[36%]"></div>
          <div className="absolute md:relative mb-6 w-16 left-2 top-2 md:w-[11rem] md:left-0 md:top-0">
            <Img src="/logo.svg" alt="logo" width="100%" height="auto" />
          </div>
          {connected ? (
            <button
              className="text-sm md:text-base py-2 px-3 md:py-3 md:px-5 bg-violet-500 text-white font-bold rounded-sm"
              onClick={handleGenerate}
            >
              {t("btn-generate")}
            </button>
          ) : (
            !mobileDisabled && (
              <div onClick={() => setConnect(true)}>
                <WalletButton />
              </div>
            )
          )}
          <div className="bg-logo mt-5 bg-top flex-1"></div>
        </div>
      ) : (
        <>
          <div className="absolute flex flex-col items-center w-full h-full">
            <div className="w-[12rem] bg-center bg-contain bg-repeat-y flex-1 opacity-10 bg-[url('/bg.svg')]"></div>
          </div>
          <div className="absolute left-2 top-2 md:top-5 md:left-5 w-16 md:w-[11rem] z-[60]">
            <Img src="/logo.svg" alt="logo" width="100%" height="auto" />
          </div>
        </>
      )}

      {connected && publicKey ? (
        data && loadState === LoadState.Loaded ? (
          <div className="h-full w-full overflow-x-hidden md:overflow-x-scroll flex flex-col justify-center">
            <div className="w-full h-fit flex items-[normal] lg:items-center pt-[3.2rem] md:pt-0 lg:pt-16 lg:min-w-[80em] bg-gradient-home flex-col lg:flex-row">
              <div className=" relative flex lg:hidden w-full mx-auto max-w-[25rem] justify-between h-7 md:h-8 mb-2 px-6 xs:px-0 z-40">
                <div
                  className={clsx(
                    tabDegen ? "opacity-50" : "opacity-100",
                    "cursor-pointer h-full w-fit relative"
                  )}
                  onClick={() => setTabDegen(true)}
                >
                  <div className="h-full">
                    <Img
                      src={"/tab_degen.svg"}
                      alt="tab degen"
                      height="100%"
                      width="auto"
                    />
                  </div>
                  <div className="absolute w-full h-full top-0 flex items-center justify-center text-xs">
                    <div className="ml-2">{t("tab-degen")}</div>
                  </div>
                </div>
                <div
                  onClick={() => setTabDegen(false)}
                  className={clsx(
                    !tabDegen ? "opacity-50" : "",
                    "cursor-pointer h-full w-fit relative"
                  )}
                >
                  <div className="h-full">
                    <Img
                      src={"/tab_token.svg"}
                      alt="tab degen"
                      height="100%"
                      width="auto"
                    />
                  </div>
                  <div className="absolute w-full h-full top-0 flex items-center justify-center text-xs">
                    <div className="mr-2">{t("tab-token")}</div>
                  </div>
                </div>
              </div>
              <div
                className={clsx(
                  "w-full lg:w-3/5 justify-center relative lg:ml-5",
                  tabDegen ? "flex" : "hidden lg:flex"
                )}
              >
                <div className="w-full max-w-[25rem]">
                  <ProfileCard
                    data={data}
                    name={name}
                    avatar={avatar}
                    motto={motto}
                    setMotto={setMotto}
                    setName={setName}
                    setAvatar={setAvatar}
                    locale={locale}
                    profileCardRef={profileCardRef}
                    wallet={wallet}
                    setTokenData={setTokenData}
                    errors={errors}
                    setErrors={setErrors}
                    handleSave={handleSave}
                    setTabDegen={setTabDegen}
                  />
                  <div className="absolute -bottom-20 hidden lg:block">
                    <SaveBtn onClick={() => handleSave(profileCardRef)}>
                      {t("btn-save", { type: "Degen" })}
                    </SaveBtn>
                  </div>
                </div>
              </div>
              <div
                className={clsx(
                  "relative lg:ml-4 justify-center w-full lg:w-auto",
                  tabDegen ? "hidden lg:flex" : "flex"
                )}
              >
                <div className="relative w-full max-w-[25rem] flex flex-col items-center lg:items-start">
                  <TokenCard
                    data={tokenData}
                    name={name}
                    avatar={avatar}
                    locale={locale}
                    tokenCardRef={tokenCardRef}
                  />
                  <div className="absolute -bottom-14 xs:-bottom-20 block">
                    <SaveBtn
                      onClick={() => handleSave(tokenCardRef)}
                      disabled={!tokenData}
                    >
                      {t("btn-save", { type: "Token" })}
                    </SaveBtn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : loadState === LoadState.Loading ? (
          <Loading setLoadState={setLoadState} hasData={!!data} />
        ) : (
          <>
            {!isProd && (
              <label
                htmlFor="testWallet"
                className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-gray-500 p-1 text-xs md:text-sm lg:text-base"
              >
                <div className="text-center text-white">
                  {"Test Wallet (leave it empty to use your own wallet): "}
                </div>
                <input
                  className="w-[20rem] md:w-[26rem]"
                  type="text"
                  placeholder="wallet address"
                  onChange={handleWalletChange}
                  value={testWallet}
                />
              </label>
            )}
          </>
        )
      ) : null}

      <div className="absolute top-4 md:top-6 right-2 md:right-4 flex h-4 md:h-7 items-center z-[45]">
        <div className="block md:hidden mr-2">
          <LocaleSwitcher />
        </div>
        <a
          href="https://x.com/degencard_wtf"
          target="_blank"
          className="h-full mr-[0.4rem] md:mr-4 mb-[0.1rem]"
        >
          <Img src={"/x_logo.svg"} alt="x logo" height="100%" width="auto" />
        </a>
        {connected && (
          <div className="wallet-top">
            <WalletButton />
          </div>
        )}
      </div>

      {open && (
        <Modal
          setOpen={setOpen}
          card={currentCard}
          imgblob={imgblob}
          s3link={s3link}
        />
      )}

      {isSaving && (
        <div className="overlay z-[60]">
          <Loader size="5rem" />
        </div>
      )}

      {mobileDisabled && (
        <div className="overlay z-[61]">
          <div className="border border-black rounded-lg py-3 px-6 w-[70%] text-violet-500 bg-yellow-100 text-xl">
            <p className="mb-5">
              Degen Card mobile version is under construction.
            </p>
            <p>For now, join us on the desktop fren!</p>
            <div className="flex justify-center mt-5">
              <div className="border border-black rounded-lg overflow-hidden w-24">
                <Img
                  src={"/goDesktop.jpg"}
                  alt="go desktop"
                  width="100%"
                  height="auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="hidden md:block absolute bottom-5 right-5 z-50">
        <LocaleSwitcher />
      </div>
    </main>
  );
}
