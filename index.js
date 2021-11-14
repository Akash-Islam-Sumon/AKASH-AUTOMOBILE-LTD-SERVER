const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rguoh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("carShoroom");
    const usersCollections = database.collection("users");
    const productsCollections = database.collection("products");
    const reviewsCollections = database.collection("Reviews");
    const orderCollections = database.collection("order");

    //   post user information
    app.post("/user", async (req, res) => {
      const data = req.body;
      const result = await usersCollections.insertOne(data);
      res.json(result);
    });
    app.put("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: usersCollections.email };
      const options = { upsert: true };
      const updateDocomentation = { $set: user };
      const result = await usersCollections.updateOne(
        filter,
        updateDocomentation,
        options
      );
      res.json(result);
    });
    // make an admin
    app.put("/user/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollections.updateOne(filter, updateDoc);
      res.json(result);
    });
    //   post reviews
    app.post("/addreviews", async (req, res) => {
      const data = req.body;
      const result = await reviewsCollections.insertOne(data);

      res.json(result);
    });
    // Add product
    app.post("/addproducts", async (req, res) => {
      const result = await productsCollections.insertOne(req.body);
      res.json(result);
    });

    // post order
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await orderCollections.insertOne(data);
      res.json(result);
    });

    // Admin Checking get
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // get myorder

    app.get("/myorders/:email", async (req, res) => {
      const myorder = await orderCollections
        .find({ email: req.params.email })
        .toArray();
      res.json(myorder);
    });
    // cancel Order

    app.delete("/cancelorder/:id", async (req, res) => {
      const result = await orderCollections.deleteOne({
        _id: ObjectId(req.params.id),
      });
      console.log(result);
    });
    // admin
    app.delete("/orderDone/:id", async (req, res) => {
      const result = await orderCollections.deleteOne({
        _id: ObjectId(req.params.id),
      });
    });
    // get products
    app.get("/products", async (req, res) => {
      const cursor = await productsCollections.find({}).toArray();
      res.json(cursor);
    });
    // get products for admin
    app.get("/allproduct", async (req, res) => {
      const cursor = await productsCollections.find({}).toArray();
      res.json(cursor);
    });
    // get for explore products
    app.get("/exploreproduct", async (req, res) => {
      const cursor = await productsCollections.find({}).toArray();
      res.json(cursor);
    });
    // get singleProduct
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollections
        .find({ _id: ObjectId(id) })
        .toArray();
      res.json(result);
    });

    // get reviews
    app.get("/reviews", async (req, res) => {
      const cursor = await reviewsCollections.find({}).toArray();
      res.json(cursor);
    });
    // get manage  product
    app.get("/order", async (req, res) => {
      const cursor = await orderCollections.find({}).toArray();
      res.json(cursor);
    });
    // DELETE PRODUCT
    app.delete("/delete/:id", async (req, res) => {
      const cursor = await productsCollections.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(cursor);
    });
  } finally {
    //   await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Running server on port :", port);
});
