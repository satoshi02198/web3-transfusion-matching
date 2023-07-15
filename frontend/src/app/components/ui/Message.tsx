import React from "react";

type MessageProps = {
  children: React.ReactNode;
  className?: string;
  type?: string;
};

const TYPE = {
  general: "bg-slate-200 text-base",
  error: "bg-red-200 text-red-700",
};

const Message: React.FC<MessageProps> = ({
  children,
  className = "",
  type = "",
}) => {
  return (
    <div
      className={`${
        TYPE[type as keyof typeof TYPE]
      } ${className} px-4 py-4 rounded-md relative`}
    >
      <div>{children}</div>
    </div>
  );
};
export default Message;
