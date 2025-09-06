import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CSSProperties, useEffect, useRef, useState } from "react";

interface IProps {
  error: FetchBaseQueryError;
  className?: string;
  style?: CSSProperties;
  scrollIntoView?: boolean;
};

export default function ErrorBlock({ error, className, style, scrollIntoView }: IProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getErrorMessage = (err: FetchBaseQueryError): string | string[] | undefined => {
    const dataMessage = (err as { data: { message: string }}).data?.message;
    if (dataMessage) return dataMessage;
    return (err as { error: string }).error;
  };

  const hasError = (err: FetchBaseQueryError): boolean => {
    const msg = getErrorMessage(err);
    return !!msg;
  };

  useEffect(() => {
    if (hasError(error)) {
      setIsVisible(true);
      if (scrollIntoView) containerRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsVisible(false);
    }
  }, [ error, scrollIntoView ]);

  const message = getErrorMessage(error);

  return (
    <>
      {message && (
        <div
          ref={containerRef}
          style={style}
          className={`${className} bg-red-100 rounded-md text-center overflow-hidden transition-all duration-[3.5s] ${
            isVisible ? 'max-h-screen ' : 'max-h-0'
          }`}
        >
          {typeof message === "string" ? (
            <p className="text-center text-red-600 font-medium p-3 text-md">{message}</p>
          ) : Array.isArray(message) ? (
            <div className="flex flex-col gap-3 p-4 rounded-md text-center">
              {message.map((res: string, index: number) => (
                <p key={index} className="capitalize text-red-600 text-md">
                  {res}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
