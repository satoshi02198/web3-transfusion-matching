import React, { Children } from "react";

type RenderNumberProps = {
  tag: string;
  children: React.ReactNode;
};

const RenderNumber: React.FC<RenderNumberProps> = ({ tag, children }) => {
  return (
    <>
      <div className="px-2 py-6 bg-slate-200 w-[90%] rounded-md space-y-2">
        <h1 className="font-bold">{tag}</h1>
        <div>{children}</div>
      </div>
    </>
  );
};
export default RenderNumber;
