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

let db, users, assets, requests;


async function run() {
  await client.connect();
  db = client.db("AssestManagement");

  users = db.collection("users");
  assets = db.collection("assets");
  requests = db.collection("requests");

  console.log("Succesfully MongoDB connected");
}
run();



app.post("/admin-signup", async (req, res) => {
  const { name, email, password, company } = req.body;

  const exist = await users.findOne({ email });
  if (exist) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);

  const result = await users.insertOne({
    name, email, password: hash, company, role: "admin"
  });

  res.json({ id: result.insertedId });
});


app.post("/employee-signup", async (req, res) => {
  const { name, email, password, company } = req.body;

  const exist = await users.findOne({ email });
  if (exist) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);

  const result = await users.insertOne({
    name, email, password: hash, company, role: "employee"
  });

  res.json({ id: result.insertedId });
});


app.post("/employee-login", async (req, res) => {
  const { email, password } = req.body;

  const user = await users.findOne({ email, role: "employee" });
  if (!user) return res.json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid password" });

  res.json({ user });
});


app.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  const user = await users.findOne({ email, role: "admin" });
  if (!user) return res.json({ message: "Admin not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid password" });

  res.json({ user });
});



app.get("/employees", async (req, res) => {
  const data = await users.find({ role: "employee" }).toArray();

  res.json(data.map(u => ({
    ...u,
    _id: u._id.toString()
  })));
});



app.post("/asset", async (req, res) => {
  await assets.insertOne({
    ...req.body,
    status: "available",
    assignedTo: null
  });

  res.json({ message: "Asset added" });
});


app.get("/assets", async (req, res) => {
  const data = await assets.find().toArray();

  res.json(data.map(a => ({
    ...a,
    _id: a._id.toString(),
    assignedTo: a.assignedTo ? a.assignedTo.toString() : null
  })));
});


app.put("/asset/:id", async (req, res) => {
  const { id } = req.params;

  await assets.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );

  res.json({ message: "Updated" });
});

// DELETE
app.delete("/asset/:id", async (req, res) => {
  const { id } = req.params;

  await assets.deleteOne({ _id: new ObjectId(id) });

  res.json({ message: "Deleted" });
});

// ASSIGN DIRECT
app.post("/asset/assign", async (req, res) => {
  const { assetId, employeeId } = req.body;

  await assets.updateOne(
    { _id: new ObjectId(assetId) },
    {
      $set: {
        assignedTo: new ObjectId(employeeId),
        status: "assigned"
      }
    }
  );

  res.json({ message: "Assigned" });
});

// EMPLOYEE ASSETS
app.get("/employee/assets/:id", async (req, res) => {
  const employeeId = req.params.id;

  const data = await assets.find({
    assignedTo: new ObjectId(employeeId)
  }).toArray();

  res.json(data);
});




// CREATE REQUEST
app.post("/asset/request", async (req, res) => {
  const { assetId, employeeId } = req.body;

  const existing = await requests.findOne({
    assetId: new ObjectId(assetId),
    employeeId: new ObjectId(employeeId),
    status: "pending"
  });

  if (existing) {
    return res.json({ message: "Already requested" });
  }

  await requests.insertOne({
    assetId: new ObjectId(assetId),
    employeeId: new ObjectId(employeeId),
    status: "pending",
    createdAt: new Date()
  });

  res.json({ message: "Request sent" });
});

// GET EMPLOYEE REQUESTS 
app.get("/asset/requests/:id", async (req, res) => {
  const employeeId = req.params.id;

  const data = await requests.find({
    employeeId: new ObjectId(employeeId)
  }).toArray();

  res.json(data.map(r => ({
    ...r,
    _id: r._id.toString(),
    assetId: r.assetId.toString(),
    employeeId: r.employeeId.toString()
  })));
});

// GET ALL REQUESTS (ADMIN)
app.get("/asset/requests", async (req, res) => {
  const data = await requests.find().toArray();
  res.json(data);
});

// Return assest request
app.post("/asset/return", async (req, res) => {
  try {
    const { assetId, employeeId } = req.body;

    const existing = await db.collection("requests").findOne({
      assetId: new ObjectId(assetId),
      employeeId: new ObjectId(employeeId),
      status: "approved"
    });

    if (!existing) {
      return res.json({ message: "No active assignment found" });
    }

    // update request status OR create return request
    await db.collection("requests").insertOne({
      assetId: new ObjectId(assetId),
      employeeId: new ObjectId(employeeId),
      status: "return_requested",
      createdAt: new Date()
    });

    res.json({ message: "Return request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Return request failed" });
  }
});


app.put("/admin/approve-return/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const request = await db.collection("requests").findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 1. mark request as returned
    await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "returned" } }
    );

    // 2. free asset
    await db.collection("assets").updateOne(
      { _id: new ObjectId(request.assetId) },
      {
        $set: {
          status: "available",
          assignedTo: null
        }
      }
    );

    res.json({ message: "Asset returned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Return approval failed" });
  }
});
// APPROVE
app.put("/admin/approve/:id", async (req, res) => {
  const id = req.params.id;

  await requests.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "approved" } }
  );

  res.json({ message: "Approved" });
});

// REJECT
app.put("/admin/reject/:id", async (req, res) => {
  const id = req.params.id;

  await requests.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "rejected" } }
  );

  res.json({ message: "Rejected" });
});



app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);