import { ToastContentProps, toast as toastifyToast } from "react-toastify";

export type DataType = {
  transactionHash: string;
  methodName: string;
  isMatched?: boolean;
};

type ErrorDataType = {
  message: string;
};

export const withToast = (promise: Promise<DataType>, variants: string) => {
  toastifyToast.promise(
    promise,
    {
      pending: {
        render() {
          return "Transaction pending...";
        },
        icon: true,
      },
      success: {
        render({ data }: ToastContentProps<DataType>) {
          // this data come from managaed/index.js and Marketplace/index.js
          return (
            <div className="space-y-2">
              <h2 className="font-semibold">{data?.methodName} Success!</h2>

              {data?.isMatched && (
                <div className="mb-4 bg-green-100 p-4 rounded-md">
                  <p className="font-semibold ">
                    You also are matched with someone who are waiting.
                  </p>

                  <p className="">
                    We will contract to your Email you provided.
                  </p>
                </div>
              )}
              <p className="text-sm text-slate-600">
                You can check the transaction
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="hover:underline text-slate-600 text-sm"
              >
                <i>
                  {data?.transactionHash?.slice(0, 10)}......
                  {data?.transactionHash?.slice(-10)}
                </i>
              </a>
            </div>
          );
        },
        // other options
        icon: "🟢",
      },
      error: {
        render({ data }: ToastContentProps<ErrorDataType>) {
          // When the promise reject, data will contains the error
          return <p>{data?.message}</p>;
        },
      },
    },
    {
      closeButton: true,
      toastId: variants,
      containerId: "register-page",
    }
  );
};
