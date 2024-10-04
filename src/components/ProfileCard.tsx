/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import clsx from "clsx";
import {
  Dispatch,
  memo,
  RefObject,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import Coins from "./Coins";
import Arrow from "./Arrow";
import {
  gaChangeAvatar,
  gaChangeMoto,
  gaEditName,
  gaRerollTags,
  gaToggleVol,
} from "@/utils/ga";
import { usePathname } from "next/navigation";
import Img from "./Img";

enum LOCALE {
  EN = "en",
  ZH = "zh",
}

type TagType = {
  en_us: string;
  zh_cn: string;
};

function ProfileCard({
  data,
  locale,
  profileCardRef,
  wallet,
  setTokenData,
  name,
  avatar,
  setName,
  setAvatar,
  motto,
  setMotto,
  errors,
  setErrors,
  handleSave,
  setTabDegen,
}: {
  data: any;
  locale: string;
  profileCardRef: RefObject<HTMLDivElement>;
  wallet: string;
  setTokenData: Dispatch<any>;
  name: string;
  avatar: number;
  motto: number;
  errors: string[];
  setName: Dispatch<SetStateAction<string>>;
  setErrors: Dispatch<SetStateAction<string[]>>;
  setAvatar: Dispatch<SetStateAction<number>>;
  setMotto: Dispatch<SetStateAction<number>>;
  setTabDegen: Dispatch<SetStateAction<boolean>>;
  handleSave: (ref: RefObject<HTMLDivElement>) => Promise<void>;
}) {
  const t = useTranslations("IndexPage");

  const [tags, setTags] = useState<TagType[]>(data?.tags?.slice(-3) || []);
  const [isVol, setVol] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const path = usePathname().slice(1);

  const degenPoints = useMemo(() => {
    return data
      ? Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(data.degen_points)
      : 0;
  }, [data]);

  const leaderboard = useMemo(() => {
    if (!data?.leaderboard) return [];
    const idx = data.leaderboard.findIndex(
      (l: any) => l.wallet_address === wallet
    );
    return [
      ...data.leaderboard.slice(idx - 2, idx),
      data.leaderboard[idx],
      ...data.leaderboard.slice(idx + 1, idx + 3),
    ];
  }, [data, wallet]);

  const handleNameChange = useCallback(
    (e: any) => {
      setName(e.target.value);
      if (errors.length) setErrors([]);
    },
    [errors, setErrors, setName]
  );

  const handleEditName = useCallback(() => {
    if (wallet) gaEditName(wallet);
    nameRef.current?.focus();
    nameRef.current?.select();
  }, [wallet]);

  const handleChangeAvatar = useCallback(() => {
    const fn = () => Math.round(Math.random() * 9);
    const m = fn();
    setAvatar(m === avatar ? fn() : m);
    if (wallet) gaChangeAvatar(wallet);
  }, [avatar, setAvatar, wallet]);

  const handleChangeMotto = useCallback(() => {
    const fn = () => Math.round(Math.random() * 9);
    const m = fn();
    setMotto(m === motto ? fn() : m);
    if (wallet) gaChangeMoto(wallet);
  }, [motto, setMotto, wallet]);

  const handleRerollTags = useCallback(() => {
    const shuffled = data?.tags?.sort(() => 0.5 - Math.random()) || [];
    setTags(shuffled.slice(-3));
    if (wallet) gaRerollTags(wallet);
  }, [data?.tags, wallet]);

  const handleToggle = useCallback(() => {
    setVol(!isVol);
    if (wallet) gaToggleVol(wallet);
  }, [isVol, wallet]);

  return (
    <section className="relative w-full px-5 xs:p-0 flex flex-col lg:block">
      <div className="w-full relative">
        <div
          ref={profileCardRef}
          data-name="profile"
          className={clsx(
            "w-full sm:w-[25rem] aspect-[3/4] rounded-xl border-2 p-2 text-xs xs:text-sm",
            path ? "bg-profile-cudis" : "bg-gradient-profile"
          )}
        >
          <div className="bg-gray-200/50 h-full w-full rounded-lg p-1 relative">
            <div className="h-[8%] card-border bg-gradient-bar mb-1 text-base">
              <input
                ref={nameRef}
                type="text"
                className="w-full h-full text-center font-bold bg-transparent focus-visible:outline-none"
                onChange={handleNameChange}
                value={name}
              />
            </div>
            <div className="card-border bg-white overflow-hidden h-2/5 flex items-end mb-1 xs:mb-2">
              <img
                src={`/avatars/avatar${avatar}.png`}
                alt="avatar"
                className="h-full"
              />
            </div>
            <div className="absolute rounded-full border overflow-hidden w-[14.5%] h-auto aspect-square top-[0.05rem] -left-[0.2rem] bg-gradient-badge flex justify-center items-center">
              {data?.trading_achievement_badge && (
                <img
                  src={`/badges/${path || "/default"}/${
                    data.trading_achievement_badge.badge
                  }.png`}
                  alt="badge"
                  className="h-4/5"
                />
              )}
            </div>
            <div className="tooltip">
              <img src={`/degenPoint.svg`} alt="degen point" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-[3.7vw] xs:text-base">
                {degenPoints}
              </div>
              <div className="tooltip-text z-[61]">{t("tip-points")}</div>
            </div>
            <div className="rounded-md xs:rounded-[0.6rem] text-[3vw] xs:text-sm border bg-gradient-bar h-[6.5%] flex justify-center items-center mb-1 xs:mb-2">
              {t("motto-list." + motto)}
            </div>
            <Coins
              data={data}
              isVol={isVol}
              setTokenData={setTokenData}
              setTabDegen={setTabDegen}
            />
            <div className="card-border bg-gradient-bar h-[16%] flex items-center justify-between">
              <div className="w-1/5 mr-6 text-center leading-tight">
                {t("rank-title")}
              </div>
              <div className="text-[0.65rem] xs:text-[0.7rem] leading-[1] xs:leading-[1.15] flex-1">
                {leaderboard.map((lb: any, idx: number) => {
                  return lb?.wallet_address === wallet ? (
                    <div key={idx}>
                      {`${lb?.rank}. ${name} (`}
                      <span
                        className={clsx(
                          data.rank_change > 0
                            ? "text-emerald-400"
                            : data.rank_change < 0
                            ? "text-red-500"
                            : ""
                        )}
                      >{`${
                        data.rank_change > 0
                          ? "↑ "
                          : data.rank_change < 0
                          ? "↓ "
                          : ""
                      }${Math.abs(data.rank_change)}`}</span>
                      {`)`}
                    </div>
                  ) : (
                    <div key={idx}>{`${lb?.rank}. ${lb?.name}`}</div>
                  );
                })}
              </div>
              <div className="flex justify-center items-center mr-2">
                <div className="w-[15vw] xs:w-14 h-[15vw] xs:h-14 border rounded-lg overflow-hidden">
                  <img
                    src={`/wojak_rank/${
                      data?.rank_change_image || "wojak_unchanged"
                    }.png`}
                    alt="rank wojak"
                  />
                </div>
              </div>
            </div>
            <p className="float-right text-[0.7rem]">
              <a href="http://degencard.wtf" target="_blank">
                degencard.wtf
              </a>
            </p>
          </div>
          <div className="tag-wrapper absolute right-0 top-[29%] flex flex-col justify-end bg-green-600/0 h-[18%]">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="relative flex justify-end items-center h-[29%] mt-1"
              >
                <img src="/tag1.svg" alt="tag" style={{ height: "100%" }} />
                <div className="absolute top-0 h-full flex items-center justify-center text-center w-4/5 text-[2.8vw] xs:text-[0.8rem] lg:text-sm">
                  <div>{locale === LOCALE.EN ? tag.en_us : tag.zh_cn}</div>
                </div>
              </div>
            ))}
            <div className="tooltip-tag">{t("tip-tag")}</div>
          </div>
          {path === "cudis" && (
            <div className="absolute bottom-[0.3rem] xs:bottom-[0.4rem] left-4 h-4">
              <Img
                src={"/degenxcudis.svg"}
                alt="degen x cudis"
                height="100%"
                width="auto"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 px-1 lg:hidden">
        <div className="flex justify-between gap-2 xs:gap-4">
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={handleEditName}
          >
            <div>{t("btn-name")}</div>
          </button>
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={handleChangeAvatar}
          >
            <div>{t("btn-avatar")}</div>
          </button>
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={handleChangeMotto}
          >
            <div>{t("btn-motto")}</div>
          </button>
        </div>
        <div className="flex justify-between mt-3 gap-2 xs:gap-4">
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={handleRerollTags}
          >
            <div>{"🎲"}</div>
          </button>
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={handleToggle}
          >
            <div>{"$/%"}</div>
          </button>
          <button
            className="card-btn-mobile active:bg-gray-500 px-1 py-1 grow"
            onClick={() => handleSave(profileCardRef)}
          >
            <div>{t("btn-save", { type: "Degen" })}</div>
          </button>
        </div>
      </div>
      <div className="absolute w-[10.5rem] top-0 -left-[11.5rem] card-btn-group">
        <button
          className="btn-item border-b border-zinc-300"
          onClick={handleEditName}
        >
          <Arrow />
          <div>{t("btn-name")}</div>
        </button>
        <button
          className="btn-item border-b border-zinc-300 text-left"
          onClick={handleChangeAvatar}
        >
          <Arrow />
          <div>{t("btn-avatar")}</div>
        </button>
        <button className="btn-item" onClick={handleChangeMotto}>
          <Arrow rotate="rotate-[35deg]" />
          <div>{t("btn-motto")}</div>
        </button>
      </div>
      <div className="absolute w-[10.5rem] -right-[11.5rem] top-1/2 card-btn-group">
        <button
          className="btn-item border-b border-zinc-300"
          onClick={handleRerollTags}
        >
          <Arrow rotate="-rotate-[135deg]" />
          <div>{t("btn-tags")}</div>
        </button>
        <button className="btn-item" onClick={handleToggle}>
          <Arrow rotate="-rotate-[180deg]" />
          <div className="flex-1 text-left">{t("btn-toggle")}</div>
        </button>
      </div>
      <div className="relative lg:absolute bottom-[98%] text-center lg:text-left xs:bottom-[101%] w-full md:w-[25rem] flex flex-col justify-end leading-tight text-xs lg:text-sm">
        {errors.map((er, idx) => (
          <div key={idx} className="mb-[0.2rem] lg:mb-2 text-red-600 font-bold">
            {er}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(ProfileCard);
