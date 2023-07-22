"use server";

import { PBKDF2, enc, lib } from "crypto-js";
import AES from "crypto-js/aes";

const secret = process.env.ADMIN_PRIVATE_KEY as string;
const iv = enc.Hex.parse(process.env.IV as string);
const salt = enc.Hex.parse(process.env.SALT as string);
const key = PBKDF2(secret, salt, { keySize: 256 / 32 });

export async function encrypt(input: string) {
  const encrypted = AES.encrypt(input, key, { iv: iv });
  console.log(encrypted.toString());
  return encrypted.toString();
}

export async function decrypt(ciphertext: string) {
  const decrypted = AES.decrypt(ciphertext, key, { iv: iv }).toString(enc.Utf8);
  return decrypted;
}
