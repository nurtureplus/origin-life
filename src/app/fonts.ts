import localFont from "next/font/local";

export const centuryGothic = localFont({
  src: "../fonts/CenturyGothicPro.otf",
  variable: "--font-heading",
  weight: "400",
  display: "swap",
});

export const notoSans = localFont({
  src: "../fonts/NotoSans-Medium.ttf",
  variable: "--font-body",
  weight: "500",
  display: "swap",
});
