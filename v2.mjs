import { ObjectId } from "mongodb";
import chats from "./conn.mjs";
import express from "express";

const app = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});


// GET de todos los chats de un usuario
app.get('/chats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    let filter = {};

    if (req.query.productId) {
        filter = {...filter, productId: req.query.productId};
    }

    const result = await chats
        .find(
          {
            "participants": {
              $in : [userId]
            },
            ...filter
          }, 
          {
            projection: {
              // obtener el último mensaje de cada chat
              "messages": { $slice: -1 }
            }
          }
        ).toArray();

    res.send(result).status(200);
  } catch (e) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/chat', async (req, res) => {
    try {
        const chat = {
            productId: req.body.productId,
            seller: req.body.seller,
            participants: [
                req.body.seller,
                req.body.user
            ],
            messages: []
        }
    
        const result = await chats.insertOne(chat);
    
        res.send(result).status(200);
    } catch (e) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default app;
