import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CSSProperties, useEffect, useRef, useState } from "react";

interface IProps {
  error: FetchBaseQueryError | any;
  className?: string;
  style?: CSSProperties;
  scrollIntoView?: boolean;
};

export default function ErrorToast({ error, className, style, scrollIntoView }: IProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error?.data) {
      setIsVisible(true);
      if (scrollIntoView) containerRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsVisible(false);
    }
  }, [ error, scrollIntoView ]);

  return (
    <div>
      {error?.data && (
        <div
          ref={containerRef}
          style={style}
          className={`${className} bg-red-100 rounded-md font-sans text-sm px-2 text-center overflow-hidden transition-all duration-[3.5s] ${
            isVisible ? 'max-h-screen ' : 'max-h-0'
          }`}
        >
          {typeof error?.data.message === "string" ? (
            <p className="text-center text-red-600 font-medium px-2 text-md">{error?.data?.message}</p>
          ) : (
            <div className="flex flex-col gap-3  rounded-md text-center py-3">
              {error?.data?.message?.map((res: any, index: number) => (
                <p key={index} className="capitalize text-red-600 text-md">
                  {res}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
