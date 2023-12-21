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

const clients = process.env.CLIENTS_URL;

const verifyToken = async (req, res, next) => {
  try {
    const response = await axios.get(`${clients}/checkToken/${req.headers.authorization}`);
    const user = response.data.user;

    if (req.params.userId != undefined && req.params.userId != user._id) {
        res.status(402).send("Unauthorized action");
        return;
    } else if (req.params.chatId != undefined) {
        const chat = await chats.findOne({_id: new ObjectId(req.params.chatId)});
        if(user._id != chat.participants[0] && user._id != chat.participants[1]) {
            res.status(402).send("Unauthorized action");
            return;
        }
    } else if (req.method == 'POST') {
        if (req.body.sender != undefined && req.body.sender != user._id) {
            res.status(402).send("Unauthorized action");
            return;
        } else if(req.body.seller != undefined && req.body.user != undefined && user._id != req.body.seller && user._id != req.body.user) {
            res.status(402).send("Unauthorized action");
            return;
        }
    }
    
    next();
  } catch {
    res.status(401).send({ error: "Invalid token" });
  }
}

app.use("/v1", verifyToken, v1);
app.use("/v2", verifyToken, v2);