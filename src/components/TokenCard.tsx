import clsx from "clsx";
import { memo, RefObject, useMemo } from "react";
import Img from "./Img";
import { useTranslations } from "next-intl";

function TokenCard({
  data,
  locale,
  name,
  avatar,
  tokenCardRef,
}: {
  data: any;
  locale: string;
  name: string;
  avatar: number;
  tokenCardRef: RefObject<HTMLDivElement>;
}) {
  const t = useTranslations("TokenCard");
  const pnl = useMemo(() => data?.pnl || 0, [data]);
  const comment = useMemo(() => {
    const num = Math.round(Math.random() + 1);
    return data?.trading_sentiment
      ? data.trading_sentiment[`${locale}_sentiment${num}`]
      : "";
  }, [data, locale]);

  const formatNum = (num: number, isSign?: boolean, isPnl?: boolean) => {
    return isPnl
      ? Intl.NumberFormat("en-US", {
          style: "percent",
          notation: "compact",
          maximumFractionDigits: 0,
          signDisplay: "exceptZero",
        }).format(num)
      : Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 1,
          signDisplay: isSign ? "exceptZero" : "never",
        }).format(num);
  };

  return (
    <section className="relative w-full text-white px-5 xs:p-0">
      <div
        className={clsx(
          "absolute z-10 top-1/2 leading-[1.4] text-center text-lg lg:text-xl text-violet-500 tracking-wider font-bold w-[83%] lg:w-[92%] left-1/2 -translate-x-1/2 -translate-y-1/2",
          data ? "hidden" : "block"
        )}
      >
        {t("title")}
      </div>
      <div className="w-full relative">
        <div
          ref={tokenCardRef}
          data-name="token"
          className={clsx(
            "relative p-2 border-2 rounded-xl w-full sm:w-[25rem] aspect-[3/4]",
            pnl > 0
              ? "bg-gradient-up"
              : pnl <= 0
              ? "bg-gradient-down"
              : "bg-gray-500/30"
          )}
        >
          <div className="bg-gray-200/40 h-full w-full rounded-lg p-[0.4rem]">
            {data && (
              <div className="h-full">
                <div
                  className={clsx(
                    "card-border h-[10%] flex justify-center items-center text-[4.5vw] xs:text-lg font-semibold",
                    pnl > 0 ? "bg-gradient-up" : "box-gradient-down"
                  )}
                >{`${name}${locale === "en" ? "'s " : "的"}${
                  data[`${locale}_tier`]
                }`}</div>
                <div className="flex justify-between mt-[2.5%] h-[35.5%] gap-[3%]">
                  <div className="token-box overflow-hidden bg-white flex items-end">
                    <Img
                      src={`/avatars/avatar${avatar}.png`}
                      alt="avatar"
                      width="auto"
                      height="100%"
                      fit="cover"
                    />
                  </div>
                  <div
                    className={clsx(
                      "token-box flex flex-col items-center justify-center",
                      pnl > 0 ? "box-gradient-up" : "box-gradient-down"
                    )}
                  >
                    <div className="rounded-full flex justify-center items-center overflow-hidden border w-[55%] h-[55%] mb-[5%]">
                      <Img
                        src={
                          data.url
                            ? data.url.includes("ipfs")
                              ? data.url.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )
                              : data.url
                            : "/coin.png"
                        }
                        alt="token icon"
                        width="100%"
                        height="100%"
                        fit="cover"
                      />
                    </div>
                    <div className="text-[4.5vw] xs:text-[1.4rem] font-bold">{`$${data.name}`}</div>
                  </div>
                </div>
                <div className="flex justify-between my-[2.5%] h-[21.4%] gap-[3%]">
                  <div
                    className={clsx(
                      "token-rec text-[3vw] xs:text-[0.8rem] font-semibold flex justify-center",
                      pnl > 0 ? "rec-gradient-up" : "box-gradient-down"
                    )}
                  >
                    <div className="rec-left">
                      <div>{t("bought")}</div>
                      <div>{t("sold")}</div>
                      <div>{t("hold")}</div>
                      <div>{t("profit")}</div>
                    </div>
                    <div className="rec-left">
                      <div>{formatNum(data.bought)}</div>
                      <div>{formatNum(data.sold)}</div>
                      <div>{formatNum(data.hold)}</div>
                      <div
                        className={clsx(
                          pnl > 0 ? "text-emerald-400" : "text-red-500"
                        )}
                      >
                        {formatNum(data.profit, true)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      "token-rec flex flex-col justify-center items-center",
                      pnl > 0 ? "rec-gradient-up" : "box-gradient-down"
                    )}
                  >
                    <div className="font-bold text-[5.2vw] xs:text-2xl mb-[4%]">
                      {t("pnl")}
                    </div>
                    <div
                      className={clsx(
                        "font-bold text-[5.3vw] xs:text-[1.4rem]",
                        pnl > 0 ? "text-emerald-400" : "text-red-500"
                      )}
                    >
                      {formatNum(pnl, true, true)}
                    </div>
                  </div>
                </div>
                <div
                  className={clsx(
                    "card-border h-1/4 flex justify-between items-center px-[4.4%]",
                    pnl > 0 ? "bar-gradient-up" : "box-gradient-down"
                  )}
                >
                  <div className="w-[25.6%] h-[68.5] border rounded-lg overflow-hidden">
                    {data && (
                      <Img
                        src={`/wojak_token/${data.trading_sentiment.image}.png`}
                        alt="rank wojak"
                        width="100%"
                        height="auto"
                      />
                    )}
                  </div>
                  <div className="font-bold text-[4.3vw] xs:text-xl text-center w-[70%] px-[5%] break-words">
                    {comment}
                  </div>
                </div>
                <p className="float-right text-[2.7vw] xs:text-[0.7rem] text-black">
                  <a href="http://degencard.wtf" target="_blank">
                    degencard.wtf
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(TokenCard);
