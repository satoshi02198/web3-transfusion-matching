import React from "react";

type SkeletonProps = {
  height?: string;
  width?: string;
  className?: string;
};

const HEIGHT = {
  "4": "h-4",
  "6": "h-6",
  "8": "h-8",
  "10": "h-10",
  "12": "h-12",
  "14": "h-14",
};

const WIDTH = {
  "10": "w-10",
  "20": "w-20",
  "30": "w-32",
  "40": "w-40",
  "50": "w-52",
  "60": "w-60",
  "70": "w-72",
};

const Skeleton: React.FC<SkeletonProps> = ({
  height = "4",
  width = "20",
  className = "",
}) => {
  return (
    <div className="animate-pulse">
      <div
        className={`${HEIGHT[height as keyof typeof HEIGHT]} ${
          WIDTH[width as keyof typeof WIDTH]
        } ${className} bg-slate-400 rounded-full dark:bg-slate-700 w-20 mx-auto`}
      ></div>
    </div>
  );
};
export default Skeleton;
