"use server";

import nodemailer from "nodemailer";
import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";

// FOR VERCEL KV
type SetUserData = {
  userAddress: string;
  emailAddress: string;
  name: string;
};

export async function setUserData({
  userAddress,
  emailAddress,
  name,
}: SetUserData) {
  try {
    await kv.hset(userAddress, { name: name, emailAddress: emailAddress });
    return "success";
  } catch (error: any) {
    console.error(error.message);
  }
}

export const getUserData = async (userAddress: string) => {
  const userData = await kv.hgetall(userAddress);
  console.log("🚀 ~ getUserData ~ userData:", userData);
  return userData;
};

// get keys with  KEYS * not recommended for production
export const getKeysWithKey = async () => {
  const allKeys = await kv.keys("*");
  console.log("🚀 ~ getKeys ~ allKeys:", allKeys);
  return allKeys;
};

export const pushToLists = async (listName: string, pushElement: any) => {
  await kv.lpush(listName, pushElement);
};

export const getAllKeysWithScan = async () => {
  let cursor = 0;
  let keys: any = [];
  while (true) {
    const scanValue = await kv.scan(cursor);
    cursor = scanValue[0];
    scanValue[1].forEach((element) => {
      keys.push(element);
    });
    if (cursor === 0) {
      break;
    }
  }
  console.log("🚀 ~ scan ~ keys:", keys);
};

export const getListValue = async (listName: string) => {
  const listValue = await kv.lrange(listName, 0, -1);
  console.log("🚀 ~ getListValue ~ listValue:", listValue);
};

// FOR VERCEL POSTGRES
export const createTable = async () => {
  const res =
    await sql`CREATE TABLE userData5 (Web3Address varchar(255), Email varchar(255), Name varchar(255), AsWhat varchar(255));`;
  console.log("🚀 ~ createTable ~ res:", res);
};

export const insertData = async (
  web3Address: string,
  emailAddress: string,
  name: string,
  methodName: string
) => {
  try {
    const res =
      await sql`INSERT INTO userData5 (Web3Address, Email, Name, AsWhat) VALUES (${web3Address},${emailAddress},${name},${methodName});`;

    console.log("🚀 ~ insertData ~ res:", res);
    await sendThankYouEmail(emailAddress, name);
  } catch (error: any) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

export const getUserDataByWeb3Address = async (
  web3Address: string | undefined
) => {
  const res =
    await sql`SELECT * FROM userData5 WHERE Web3Address=${web3Address}`;
  console.log("🚀 ~ getUserDataByWeb3Address ~ res:", res);
  return res;
};

export async function deleteData(
  dataName: string,
  where: string,
  value: string
) {
  const res = await sql`DELETE FROM userData5 WHERE ${where}=${value}`;
  console.log("🚀 ~ deleteData ~ res:", res);
}

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
