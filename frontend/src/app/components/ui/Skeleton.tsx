import React from "react";

type SkeletonProps = {
  height?: string;
  width?: string;
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
  "20": "w-20",
  "30": "w-30",
  "40": "w-40",
  "50": "w-50",
  "60": "w-60",
  "70": "w-70",
};

const Skeleton: React.FC<SkeletonProps> = ({ height = "4", width = "20" }) => {
  return (
    <div className="animate-pulse">
      <div
        className={`${HEIGHT[height as keyof typeof HEIGHT]} ${
          WIDTH[width as keyof typeof WIDTH]
        } bg-slate-200 rounded-full dark:bg-slate-700 w-20 mx-auto`}
      ></div>
    </div>
  );
};
export default Skeleton;
