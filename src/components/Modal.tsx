import { useTranslations } from "next-intl";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { saveAs } from "file-saver";
import { gaDownload, gaPost } from "@/utils/ga";
import { useWallet } from "@solana/wallet-adapter-react";
import useMobileDetect from "@/utils/useDeviceDetect";
import { usePathname } from "next/navigation";

export default function Modal({
  setOpen,
  card,
  imgblob,
  s3link,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  card: string;
  imgblob: Blob | null;
  s3link: string;
}) {
  const { publicKey } = useWallet();
  const [showCopied, setShowCopied] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const t = useTranslations("Modal");
  const isAndroidWebView = useMobileDetect().isAndroidWebView();
  const isIOSWebView = useMobileDetect().isIOSWebView();
  const isIOS = useMobileDetect().isIos();
  const path = usePathname().slice(1);

  const handleDownload = useCallback(() => {
    // console.log(imgblob);
    if (imgblob) {
      saveAs(imgblob, "my-degen-card.png");
      if (publicKey && card) gaDownload(publicKey.toBase58(), card);
    }
  }, [card, imgblob, publicKey]);

  const handleCopyLink = useCallback(async () => {
    try {
      await window.navigator.clipboard.writeText(s3link);
      setShowLinkCopied(true);
    } catch (error: any) {
      console.log(error.message);
    }
  }, [s3link]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (showCopied) {
      t = setTimeout(() => {
        setShowCopied(false);
      }, 5000);
    }
    return () => {
      clearTimeout(t);
    };
  }, [showCopied]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (showLinkCopied) {
      t = setTimeout(() => {
        setShowLinkCopied(false);
      }, 5000);
    }
    return () => {
      clearTimeout(t);
    };
  }, [showLinkCopied]);

  const handleCopy = useCallback(async () => {
    try {
      if (imgblob && window) {
        const item = new ClipboardItem({ [imgblob.type]: imgblob });
        // console.log(item);
        await window.navigator.clipboard.write([item]);
        setShowCopied(true);
        // console.log("image copied");
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }, [imgblob]);

  const handleShare = useCallback(() => {
    if (publicKey && card) gaPost(publicKey.toBase58(), card);
  }, [card, publicKey]);

  return (
    <div className="absolute w-full h-full bg-gray-500/50 top-0 flex justify-center items-center z-[61] px-4 md:px-0">
      <div className="relative w-full md:w-[45rem] h-fit flex flex-col pt-7 xs:pt-12 pb-10 bg-yellow-100 border rounded-lg">
        <button
          className="absolute top-1 right-1 xs:top-2 xs:right-2 w-7 h-7 sm:w-10 sm:h-10 bg-slate-200 border border-black rounded-lg text-xl sm:text-3xl text-center"
          onClick={() => setOpen(false)}
        >
          X
        </button>
        <div className="w-full mx-auto modal-text">
          <div className="text-left xs:text-center leading-[1.4] px-5 xs:px-10">
            <p>{t("title1")}</p>
            <p>{t("title11")}</p>
          </div>
          {isAndroidWebView ? (
            <div className="px-5 xs:px-14 mt-10">
              <div className="leading-tight mb-5 text-left xs:text-center">{t("android-download")}</div>
              <div className="flex h-7 w-full justify-between items-center">
                <input
                  type="text"
                  value={s3link}
                  readOnly
                  className="text-black py-1 px-2 text-xs flex-1"
                />
                <div className="relative h-full flex items-center">
                  {showLinkCopied && (
                    <div className="absolute -top-5 w-full text-center font-normal text-black text-xs xs:text-base">
                      {t("copied")}
                    </div>
                  )}
                  <button
                    onClick={handleCopyLink}
                    className="modal-btn-mobile h-[110%] px-2 -ml-1"
                  >
                    {t("btn-link")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex pl-5 xs:pl-0 xs:justify-center items-center h-10 xs:h-12 my-7 xs:my-8">
                <p>{t("title2")}</p>
                <div className="relative mx-1 sm:mx-4 h-full">
                  {showCopied && (
                    <div className="absolute -top-5 xs:-top-6 w-full text-center font-normal text-xs xs:text-base text-black">
                      {t("copied")}
                    </div>
                  )}
                  <button
                    className="modal-btn-mobile xs:card-button h-full w-20 xs:w-28 sm:w-32 leading-tight"
                    onClick={handleCopy}
                  >
                    {t("btn-copy")}
                  </button>
                </div>
                <p>{t("title3")}</p>
                <a
                  className="twitter-share-button mx-1 sm:mx-4 h-full"
                  href={`https://twitter.com/intent/tweet?text=${t(
                    "text-share",
                    {
                      type: card === "profile" ? "Degen" : "Token",
                    }
                  )}${path ? '%20%40CudisWellness' : ''}`}
                  target="_blank"
                  onClick={handleShare}
                >
                  <button className="modal-btn-mobile xs:card-button h-full w-14 xs:w-24">
                    {t.rich("btn-share", {
                      icon: (chunks) => (
                        <span className="text-sm xs:text-lg xs:ml-1">
                          {chunks}
                        </span>
                      ),
                    })}
                  </button>
                </a>
                <p>{t("title4")}</p>
              </div>
              {isIOSWebView || isIOS ? (
                <div className="px-5 xs:px-14">
                  <div className="leading-tight mb-1 text-left sm:text-center">{t("ios-download")}</div>
                  <div className="flex h-7 w-full justify-between items-center">
                    <input
                      type="text"
                      value={s3link}
                      readOnly
                      className="text-black py-1 px-2 text-xs flex-1"
                    />
                    <div className="relative h-full flex items-center">
                      {showLinkCopied && (
                        <div className="absolute -bottom-5 w-full text-center font-normal text-black text-xs xs:text-base">
                          {t("copied")}
                        </div>
                      )}
                      <button
                        onClick={handleCopyLink}
                        className="modal-btn-mobile h-[110%] px-2 -ml-1"
                      >
                        {t("btn-link")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex pl-5 xs:pl-0 items-center xs:justify-center h-9 xs:h-12">
                  <p>{t("title5")}</p>
                  <button
                    onClick={handleDownload}
                    className="modal-btn-mobile xs:card-button px-3 w-52 xs:w-56 mx-4 h-full"
                  >
                    {t.rich("btn-download", {
                      icon: (chunks) => <span className="ml-1">{chunks}</span>,
                    })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
