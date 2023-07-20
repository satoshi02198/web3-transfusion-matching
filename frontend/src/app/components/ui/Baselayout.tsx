import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type BaselayoutProps = {
  children: React.ReactNode;
};

const Baselayout: React.FC<BaselayoutProps> = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto ">
      <NavBar />
      <ToastContainer
        className="w-80 mt-4 ml-4 sm:w-[450px] sm:mt-0 sm:ml-0"
        bodyClassName=" p-2"
        toastClassName="bg-slate-50"
        containerId={"register-page"}
        enableMultiContainer
        position="top-right"
        closeOnClick={true}
        pauseOnFocusLoss
        autoClose={false}
      />
      <ToastContainer
        className="w-40 text-center font-semibold"
        toastClassName="bg-slate-50"
        containerId={"copy"}
        enableMultiContainer
        position="top-center"
        closeButton={false}
        pauseOnFocusLoss
        autoClose={false}
      />
      {/* <ToastContainer containerId="ofKv" /> */}
      {children}
      <Footer />
    </div>
  );
};
export default Baselayout;
