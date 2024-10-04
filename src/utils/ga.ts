import { sendGAEvent } from "@next/third-parties/google";
import { isProd } from "./constants";

// 连接钱包次数 + 独立钱包数量(需要到wallet_connect手动拉表)
export const gaWalletConnected = (address: string) => {
  isProd &&
    sendGAEvent("event", "wallet_connected", {
      address,
    });
};

// 点击Save & Share 按钮次数
export const gaSave = (address: string, cardType: string | null) => {
  isProd &&
    sendGAEvent("event", "save_click", {
      address,
      cardType: cardType || "",
    });
};

// 点击分享到X按钮次数
export const gaPost = (address: string, cardType: string) => {
  isProd && sendGAEvent("event", "post_click", {
    address,
    cardType
  });
};

// 点击下载图片到本地次数
export const gaDownload = (address: string, cardType: string) => {
  isProd && sendGAEvent("event", "download_click", {
    address,
    cardType
  });
};

// 点击Edit Name次数 (直接点击input框不算)
export const gaEditName = (address: string) => {
  isProd && sendGAEvent("event", "edit_name_click", {
    address,
  });
}

// 点击Change Avatar次数
export const gaChangeAvatar = (address: string) => {
  isProd && sendGAEvent("event", "change_avatar_click", {
    address,
  });
}

// 点击Change Motto次数
export const gaChangeMoto = (address: string) => {
  isProd && sendGAEvent("event", "change_motto_click", {
    address,
  });
}

// 点击Reroll tags次数
export const gaRerollTags = (address: string) => {
  isProd && sendGAEvent("event", "reroll_tags_click", {
    address,
  });
}

// 点击toggle volume/percentage次数
export const gaToggleVol = (address: string) => {
  isProd && sendGAEvent("event", "toggle_vol_click", {
    address,
  });
}

// 点击代币图标次数
export const gaCoin = (address: string, coinType: string) => {
  isProd && sendGAEvent("event", "coin_click", {
    address,
    coinType
  });
}

