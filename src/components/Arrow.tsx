import clsx from "clsx";
import Img from "./Img";

const Arrow = ({ rotate }: { rotate?: string }) => {
  return (
    <div
      className={clsx(
        "w-8 h-8 mr-3 rounded-full bg-zinc-300 flex justify-center items-center",
        rotate
      )}
    >
      <Img src={"/arrow.svg"} alt="arrow" width="50%" height="auto" />
    </div>
  );
};

export default Arrow;
