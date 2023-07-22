"use server";

import EthCrypto from "eth-crypto";

import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";

// FOR VERCEL POSTGRES
export const createTable = async () => {
  const res =
    await sql`CREATE TABLE userData5 (Web3Address varchar(255), Email varchar(255), Name varchar(255), AsWhat varchar(255));`;
  console.log("🚀 ~ createTable ~ res:", res);
};

// INSERT DATA AND SEND THANK YOU EMAIL
export const insertData = async (
  web3Address: string,
  emailAddress: string,
  name: string,
  donorOrRecipient: string
) => {
  try {
    const res =
      await sql`INSERT INTO userData5 (Web3Address, Email, Name, AsWhat) VALUES (${web3Address},${emailAddress},${name},${donorOrRecipient});`;
    console.log("🚀 ~ insertData ~ res:", res);
    await sendThankYouEmail(emailAddress, name);
  } catch (error: any) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

// TO GET EMAIL ADDRESS BY WEB3 ADDRESS
export const getUserDataByWeb3Address = async (
  web3Address: string | undefined
) => {
  console.log(web3Address);
  const res =
    await sql`SELECT * FROM userData5 WHERE Web3Address=${web3Address}`;
  console.log("🚀 ~ getUserDataByWeb3Address ~ res:", res);
  return res;
};

// TO DELETE DATA
export async function deleteData(
  dataName: string,
  where: string,
  value: string
) {
  // ${where} part cann't be paramiralised
  const res = await sql`DELETE FROM userData5 WHERE ${where}=${value}`;
  console.log("🚀 ~ deleteData ~ res:", res);
}

// TO DELETE TABLE
export async function deleteTable(tableName: string) {
  const res = await sql`DROP TABLE satoshi;`;
  console.log("🚀 ~ deleteTable ~ res:", res);
}

// TO SEND THANK YOU EMAIL
async function sendThankYouEmail(emailAddress: string, name: string) {
  const trasnporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: emailAddress,
    subject: "Thank you for your Testing app!",
    //
    html: `
    <div style="color: #333;">
    <h1>Thank you for your Testing app!</h1>
    <p>This app is test apprication</p>
    <p>You can contact me if you have any question from below.</p>
    <a href="https://satoshi-okazaki.vercel.app/"
    target="_blank"
    rel="noopener"
    >My portfolio site</a>
    </div>`,
  };

  try {
    const info = await trasnporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.response);
    console.log("Message ID: %s", info.messageId);
  } catch (error: any) {
    console.error("Error sending email", error);
  }
}

