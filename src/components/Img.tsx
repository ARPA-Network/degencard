import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { useEffect, useState } from "react";

type ObjectFit =  "contain" | "cover" | "fill" | "none" | "scale-down";
const Img = ({
  src,
  alt,
  width,
  height,
  fit
}: {
  src: string | StaticImport;
  alt: string;
  width: string;
  height: string;
  fit?: ObjectFit;
}) => {
  const [imgSrc, setImgSrc] = useState(src || '');

  useEffect(() => {
    setImgSrc(src)
  }, [src])
  
  return (
    <Image
      width={100}
      height={100}
      src={imgSrc}
      alt={alt}
      sizes="100vw"
      style={{
        width,
        height,
        objectFit: fit || 'initial'
      }}
      onError={() => {setImgSrc('/coin.png')}}
    />
  );
};

export default Img;
