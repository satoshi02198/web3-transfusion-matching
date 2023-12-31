"use client";

import { useWeb3 } from "./components/providers/Provider";
import Skeleton from "./components/ui/Skeleton";
import useDataSet from "./components/hooks/useDataSet";
import Image from "next/image";
import RenderNumber from "./components/ui/RenderNumber";

export type AllDonorInfo = {
  address: string | undefined;
  id: number | null;
  name: string | null;
  bloodType: string | null;
  state: number | null;
};

const Home = () => {
  const { contract, contractIsLoading } = useWeb3();
  const { donorAddress, recipientAddress, donorsStatus } = useDataSet(contract);

  const matchingNum = donorsStatus?.filter((state: any) => state === 3).length;

  const pushToInstallWallet = () => {
    return (
      <p>
        please install{" "}
        <a
          href="https://metamask.io/"
          target="_blank"
          className="border-b border-slate-800"
        >
          Meta Mask
        </a>{" "}
      </p>
    );
  };

  const renderList = [
    { tag: "Donors", value: donorsStatus?.length },
    { tag: "Recipients", value: recipientAddress?.length },
    { tag: "Matching(pair)", value: matchingNum },
  ];

  return (
    <div className="h-screen py-2 sm:px-10">
      <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0  items-center justify-between text-center mx-auto">
        {renderList.map(({ tag, value }) => (
          <RenderNumber tag={tag} key={tag}>
            {contractIsLoading ? (
              <Skeleton height="4" width="20" />
            ) : contract ? (
              <p>{value ?? ""}</p>
            ) : (
              <div>{pushToInstallWallet()}</div>
            )}
          </RenderNumber>
        ))}
      </div>
      <Image
        src="/love.jpg"
        alt="header"
        width={1280}
        height={500}
        className="mt-2 w-[90%] sm:w-full mx-auto"
      />
    </div>
  );
};

export default Home;
