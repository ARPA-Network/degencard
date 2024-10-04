import clsx from "clsx";
import Img from "./Img";
import { Dispatch, memo, SetStateAction, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@solana/wallet-adapter-react";
import { gaCoin } from "@/utils/ga";

const Col = ({
  type,
  isVol,
  coin,
  setTokenData,
  wallet,
  setTabDegen
}: {
  type: string;
  isVol: boolean;
  coin: any;
  setTokenData: Dispatch<any>;
  wallet: string;
  setTabDegen: Dispatch<SetStateAction<boolean>>
}) => {
  const formattedNum = useMemo(() => {
    return isVol
      ? Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 1,
          signDisplay: "exceptZero",
        }).format(coin.profit)
      : Intl.NumberFormat("en-US", {
          style: "percent",
          notation: "compact",
          maximumFractionDigits: 0,
          signDisplay: "exceptZero",
        }).format(coin.pnl);
  }, [isVol, coin]);

  const handleClick = useCallback(() => {
    setTokenData(coin);
    setTabDegen(false)
    if (wallet && type) gaCoin(wallet, type);
  }, [coin, setTabDegen, setTokenData, type, wallet]);

  return (
    <div className="w-1/3 leading-none flex flex-col items-center">
      <div
        className="cursor-pointer rounded-full flex justify-center items-center overflow-hidden w-[9.2vw] xs:w-[2.2rem] h-[9.2vw] xs:h-[2.2rem] mb-[0.1rem] xs:mb-[0.3rem] border"
        onClick={handleClick}
      >
        <Img
          src={
            coin.url
              ? coin.url.includes("ipfs")
                ? coin.url.replace("ipfs://", "https://ipfs.io/ipfs/")
                : coin.url
              : "/coin.png"
          }
          alt="token icon"
          width="100%"
          height="100%"
          fit="cover"
        />
      </div>
      <div>{`${coin.name}`}</div>
      <div
        className={clsx(
          "mt-[0.1rem] text-[0.55rem] xs:text-[0.7rem]",
          type === "up" ? "text-teal-300" : "text-[#ff0000]"
        )}
      >
        {formattedNum}
      </div>
    </div>
  );
};

function Coins({
  data,
  isVol,
  setTokenData,
  setTabDegen
}: {
  data: any;
  isVol: boolean;
  setTokenData: Dispatch<any>;
  setTabDegen: Dispatch<SetStateAction<boolean>>
}) {
  const { publicKey } = useWallet();
  const t = useTranslations("IndexPage");
  const dataList = useMemo(() => {
    return {
      gain: isVol ? data?.gainers : data?.gainers_pnl || [],
      lose: isVol ? data?.losers : data?.losers_pnl || [],
    };
  }, [isVol, data]);

  return (
    <div className="flex justify-between mb-1 xs:mb-2 h-[22.5%] xs:h-[21%] text-[0.65rem] xs:text-[0.7rem]">
      <div className="coin-box">
        <div className="text-center xs:mb-1 text-[3vw] xs:text-sm h-[28%]">
          <div className="flex justify-center items-center h-full">
            {t("coin-up")}
          </div>
        </div>
        <div className="flex justify-center h-[72%] items-center">
          {dataList.gain.length ? (
            dataList.gain.map((gp: any) => (
              <Col
                key={gp.name}
                type="up"
                isVol={isVol}
                coin={gp}
                setTokenData={setTokenData}
                wallet={publicKey?.toBase58() || ""}
                setTabDegen={setTabDegen}
              />
            ))
          ) : (
            <div>{t("coin-none")}</div>
          )}
        </div>
      </div>
      <div className="coin-box">
        <div className="text-center xs:mb-1 text-[3vw] xs:text-sm h-[25%]">
          <div className="flex justify-center items-center h-full">
            {t("coin-down")}
          </div>
        </div>
        <div className="flex justify-center h-[72%] items-center">
          {dataList.lose.length ? (
            dataList.lose.map((gp: any) => (
              <Col
                key={gp.name}
                type="down"
                isVol={isVol}
                coin={gp}
                setTokenData={setTokenData}
                wallet={publicKey?.toBase58() || ""}
                setTabDegen={setTabDegen}
              />
            ))
          ) : (
            <div>{t("coin-none")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Coins);
