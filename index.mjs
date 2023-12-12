import express from "express";
import v1 from "./v1.mjs";
import v2 from "./v2.mjs";
import cors from "cors";
import axios from "axios";

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
    next();
  } catch {
    res.status(401).send({ error: "Invalid token" });
  }
}

app.use("/v1", verifyToken, v1);
app.use("/v2", verifyToken, v2);