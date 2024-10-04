import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export default function SaveBtn({
  onClick,
  disabled = false,
  style = "",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  style?: string;
  children?: ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        style,
        "card-btn-mobile xs:card-button px-5 py-2 xs:px-7 xs:py-5 active:bg-gray-500",
        disabled ? "opacity-50" : ""
      )}
    >
      {children}
    </button>
  );
}
