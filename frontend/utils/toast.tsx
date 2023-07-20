import { ToastContentProps, toast as toastifyToast } from "react-toastify";
import { insertData } from "./actions";

export type DataType = {
  transactionHash: string;
  methodName: string;
  isMatched?: boolean;
  address?: string;
  input?: {
    name: string;
    bloodType: string;
    emailAddress: string;
  };
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
          if (data?.input) {
            // to set user email with vercel postgres
            const insertUserData = insertData(
              data?.address as string,
              data?.input.emailAddress,
              data?.input.name,
              data?.methodName
            );
            insertUserData
              .then(() => console.log("successfully inserted user data"))
              .catch((error) => {
                toastifyToast.error(
                  ({ closeToast, toastProps }) => (
                    <div>
                      <h2 className="font-semibold mb-2">
                        Email Address was not registered.
                      </h2>
                      <p className="bg-red-300 rounded-lg px-2 py4">
                        Sorry, something went wrong.
                      </p>
                      <p>
                        Your email address is not registered even though you are
                        registered in blockchain.
                      </p>
                      <p>
                        because email address is not stored in blockchain as
                        privacy reasons.
                      </p>
                      <p>Please contact us with your web3 address.</p>
                      <h2 className="font-semibold mt-2">
                        Error Detail for developer
                      </h2>
                      <p> Error detail: ${error.message}</p>
                    </div>
                  ),
                  {
                    containerId: "register-page",
                  }
                );
              });
          }

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
