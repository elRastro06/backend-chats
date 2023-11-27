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
    const result = await chats
        .find(
          {
            "participants": {
              $in : [userId]
            }
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

// GET de un chat específico por ID
app.get('/chat/:chatId', async (req, res) => {
  try {

    const chat = await chats.findOne({_id: new ObjectId(req.params.chatId)});

    if (!chat) {
      res.status(404).send({ error: 'Chat not found' });
      return;
    }else {
      // Ordenar los mensajes por timestamp
      chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    res.send(chat).status(200);
  } catch (e) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


// Enviar un nuevo mensaje al chat
app.post('/chat/:chatId/message', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { sender, content } = req.body;
    const timestamp = new Date();

    if (!sender || !content) {
      res.status(404).send({ error: 'Missing sender or content' });
      return;
    }

    const result = await chats.updateOne(
      { _id: new ObjectId(chatId) },
      { $push: { messages: { sender, content, timestamp } } }
    );

    

    if (result.modifiedCount === 0) {
      res.status(404).send({ error: 'Chat not found' });
      return;
    }

    res.status(201).send({ message: 'Message sent successfully' });
  } catch (e) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

export default app;
