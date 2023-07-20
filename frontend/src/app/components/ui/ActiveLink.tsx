import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type ActiveLinkProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
};

const ActiveLink: React.FC<ActiveLinkProps> = ({ children, ...props }) => {
  const pathname = usePathname();
  let className = props.className || "";
  if (pathname === props.href) {
    className = `${className} text-blue-600 `;
  }
  return (
    <Link href={props.href} className={`${className} hover:text-blue-700`}>
      {" "}
      {children}
    </Link>
  );
};
export default ActiveLink;
