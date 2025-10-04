import clientPromise from "@/lib/mongodb";
import CryptoJS from "crypto-js";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";

const SECRET_KEY = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const client = await clientPromise;
  const db = client.db("passop");
  const { id } = req.query;

  if (req.method === "GET") {
    const credential = await db.collection("credentials").findOne({ _id: new ObjectId(id) });
    if (!credential) return res.status(404).json({ message: "Not found" });

    credential.password = CryptoJS.AES.decrypt(credential.password, SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );

    res.status(200).json(credential);
  }

  else if (req.method === "PUT") {
    const { website, username, password } = req.body;
    const updateData = {};
    if (website) updateData.website = website;
    if (username) updateData.username = username;
    if (password) updateData.password = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    await db.collection("credentials").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.status(200).json({ message: "Credential updated" });
  }

  else if (req.method === "DELETE") {
    await db.collection("credentials").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Credential deleted" });
  }

  else {
    res.status(405).end("Method not allowed");
  }
}
