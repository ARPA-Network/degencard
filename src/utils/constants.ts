export enum LoadState {
  Loading,
  Loaded,
  Idle,
}
export const isProd = process.env.NEXT_PUBLIC_IS_PROD === "1";
export const isTestMobile = process.env.NEXT_PUBLIC_TEST_MOBILE === "1";
export const isMobileDraft = process.env.NEXT_PUBLIC_MOBILE_DRAFT === "1";