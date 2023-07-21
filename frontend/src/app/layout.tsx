import Web3Provider from "./components/providers/Provider";
import Baselayout from "./components/ui/Baselayout";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Transfusion app",
  description: "Matching app for Donors and Recipients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <Baselayout>{children}</Baselayout>
        </Web3Provider>
      </body>
    </html>
  );
}
