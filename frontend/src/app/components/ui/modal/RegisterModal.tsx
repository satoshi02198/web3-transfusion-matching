"use client";

// import shadcn/ui components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcnComponents/alert-dialog";
import { DataType, withToast } from "../../../../../utils/toast";
import { useState } from "react";
import { toast } from "react-toastify";
type DeregisterModalProps = {
  variants: string;
  deRegister?: (donorOrRecipient: string) => Promise<DataType>;
  register?: (
    reciOrDor: string,
    input: {
      name: string;
      bloodType: string;
    },
    address: string | undefined
  ) => Promise<DataType>;
  method?: "Donor" | "Recipient";
  reciOrDor?: string;
  input?: {
    name: string;
    bloodType: string;
  };
  handleAfterRegi?: () => void;
  address?: string | undefined;
};

// interface ToastItem<Data = {}> {
//   id: Id;
//   content: React.ReactNode;
//   theme?: Theme;
//   type?: TypeOptions;
//   isLoading?: boolean;
//   containerId?: Id;
//   data: Data;
//   icon?: React.ReactNode | false;
//   status: "added" | "removed" | "updated";
// }

const RegisterModal: React.FC<DeregisterModalProps> = ({
  variants,
  deRegister = () => Promise.resolve({} as DataType),
  register = () => Promise.resolve({} as DataType),
  method = "",
  reciOrDor = "",
  input = {
    name: "",
    bloodType: "",
  },
  handleAfterRegi = () => {},
  address = "",
}) => {
  // to handle toast
  const [isTransactioning, setIsTransactioning] = useState(false);

  if (variants === "deregister") {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isTransactioning}
          className="bg-slate-600 px-4 py-2 text-base text-slate-100 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-default"
        >
          De register as {method}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will change your state to
              Deleted in blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-slate-600 px-4 py-2 text-base text-slate-100 rounded-md hover:bg-slate-700 transition-all duration-200"
              onClick={() => {
                setIsTransactioning(true);
                withToast(deRegister(method), variants);
                toast.onChange((payload) => {
                  if (payload.status === "removed" && payload.id === variants) {
                    setIsTransactioning(false);
                  }
                });
              }}
            >
              Deregister
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else if (variants === "register") {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          disabled={
            !input.name || !input.bloodType || !reciOrDor || isTransactioning
          }
          className="bg-slate-600 px-5 py-3 text-base text-slate-100 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-default"
        >
          Register as {reciOrDor}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank you for registering!</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Please confirm your information and continue.</p>
              <p>You will be asked execution for transaction.</p>
            </AlertDialogDescription>
            <AlertDialogDescription className="bg-slate-50 text-slate-900 px-2 py-4 space-y-2 rounded-lg">
              <p>Name: {input.name}</p>
              <p>BloodType: {input.bloodType}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-slate-700"
              onClick={() => {
                setIsTransactioning(true);
                withToast(register(reciOrDor, input, address), variants);
                handleAfterRegi();
                toast.onChange((payload) => {
                  if (payload.status === "removed" && payload.id === variants) {
                    setIsTransactioning(false);
                  }
                });
              }}
            >
              Register 🌏
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
};
export default RegisterModal;
