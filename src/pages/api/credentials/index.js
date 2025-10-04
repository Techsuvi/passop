import clientPromise from "@/lib/mongodb";
import CryptoJS from "crypto-js";
import { getSession } from "next-auth/react";

const SECRET_KEY = process.env.NEXTAUTH_SECRET; // Use for encrypt/decrypt

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const client = await clientPromise;
  const db = client.db("passop");

  const userEmail = session.user.email;

  if (req.method === "GET") {
    const credentials = await db
      .collection("credentials")
      .find({ userEmail })
      .toArray();

    const decrypted = credentials.map((c) => ({
      ...c,
      password: CryptoJS.AES.decrypt(c.password, SECRET_KEY).toString(CryptoJS.enc.Utf8),
    }));

    res.status(200).json(decrypted);
  }

  else if (req.method === "POST") {
    const { website, username, password } = req.body;
    if (!website || !username || !password)
      return res.status(400).json({ message: "Missing fields" });

    const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const newCredential = {
      userEmail,
      website,
      username,
      password: encryptedPassword,
      createdAt: new Date(),
    };

    await db.collection("credentials").insertOne(newCredential);
    res.status(201).json({ message: "Credential added" });
  }

  else {
    res.status(405).end("Method not allowed");
  }
}
