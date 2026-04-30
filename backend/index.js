const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const port = 6200;

const uri =
  "mongodb+srv://imnithyania_db_user:assestmanagement@cluster0.u8inslq.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

let db;
let users;
let assets;
let requests;

async function run() {
  await client.connect();
  db = client.db("AssestManagement");

  users = db.collection("users");
  assets = db.collection("assets");
  requests = db.collection("requests");

  console.log("✅ MongoDB connected");
}

run();

// ================= EMPLOYEE SIGNUP =================
app.post("/employee-signup", async (req, res) => {
  const { name, email, password, department } = req.body;

  const exist = await users.findOne({ email });
  if (exist) return res.json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);

  await users.insertOne({
    name,
    email,
    password: hash,
    role: "employee",
    department,
  });

  res.json({ message: "Employee created" });
});

// ================= EMPLOYEE LOGIN =================
app.post("/employee-login", async (req, res) => {
  const { email, password } = req.body;

  const user = await users.findOne({ email, role: "employee" });
  if (!user) return res.json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret123");

  res.json({ token, user });
});

// ================= ADMIN LOGIN =================
app.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  const user = await users.findOne({ email, role: "admin" });

  if (!user) return res.json({ message: "Admin not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid password" });

  res.json({ user });
});

// ================= ASSETS =================
app.post("/asset", async (req, res) => {
  await assets.insertOne({
    ...req.body,
    status: "available",
    assignedTo: null,
  });

  res.json({ message: "Asset added" });
});

app.get("/assets", async (req, res) => {
  const data = await assets.find().toArray();
  res.json(data);
});

// ================= REQUEST ASSET =================
app.post("/asset/request", async (req, res) => {
  const { assetId, employeeId } = req.body;

  await requests.insertOne({
    assetId,
    employeeId,
    status: "pending",
    date: new Date(),
  });

  res.json({ message: "Request sent" });
});

// GET employee requests
app.get("/asset/requests", async (req, res) => {
  const data = await requests.find().toArray();
  res.json(data);
});

// ================= APPROVE =================
app.post("/asset/approve", async (req, res) => {
  const { requestId, assetId, employeeId } = req.body;

  await requests.updateOne(
    { _id: new ObjectId(requestId) },
    { $set: { status: "approved" } }
  );

  await assets.updateOne(
    { _id: new ObjectId(assetId) },
    {
      $set: {
        status: "assigned",
        assignedTo: employeeId,
      },
    }
  );

  res.json({ message: "Approved" });
});

// ================= REJECT =================
app.post("/asset/reject", async (req, res) => {
  const { requestId } = req.body;

  await requests.updateOne(
    { _id: new ObjectId(requestId) },
    { $set: { status: "rejected" } }
  );

  res.json({ message: "Rejected" });
});

app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);