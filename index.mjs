import express from "express";
import v1 from "./v1.mjs";
import v2 from "./v2.mjs";
import cors from "cors";
import axios from "axios";
import chats from "./conn.mjs";
import { ObjectId } from "mongodb";

const app = express();
const port = 5007;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

const clients = process.env.CLIENTS != undefined ? process.env.CLIENTS : "localhost";

const verifyToken = async (req, res, next) => {
  try {
    const response = await axios.get(`http://${clients}:5000/checkToken/${req.headers.authorization}`);
    const user = response.data.user;

    if (req.params.userId != undefined && req.params.userId != user._id) res.status(402).send("Unauthorized action");
    else if (req.params.chatId != undefined) {
        const chat = await chats.findOne({_id: new ObjectId(req.params.chatId)});
        if(user._id != chat.participants[0] && user._id != chat.participants[1]) res.status(402).send("Unauthorized action");
    }

    next();
  } catch {
    res.status(401).send({ error: "Invalid token" });
  }
}

app.use("/v1", verifyToken, v1);
app.use("/v2", verifyToken, v2);