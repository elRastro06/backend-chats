import { MongoClient } from "mongodb";
import 'dotenv/config';

const connectionString = process.env.CONNECTION_STRING;
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
} catch (e) {
  console.error(e);
}
let db = conn.db("web");
let products = db.collection("chats");
export default products;