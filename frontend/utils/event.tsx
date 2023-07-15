import { Contract, ethers } from "ethers";

// to get Event logs
export const getEvents = async (
  contract: Contract | null,
  eventName: string,
  provider: ethers.BrowserProvider | null
) => {
  if (!contract || !provider) return;
  try {
    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(filter);
    return events;
  } catch (error: any) {
    console.log(error.message);
  }
};

// to get timestamp from event log:
export const getTimestamp = async (
  logEvent: any,
  provider: ethers.BrowserProvider | null
) => {
  if (!logEvent || !provider) return;
  const block = await provider.getBlock(logEvent.blockNumber);
  const timestamp = block?.timestamp;
  return new Date((timestamp as number) * 1000).toLocaleString();
};
