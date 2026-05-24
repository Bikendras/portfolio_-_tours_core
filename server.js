const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

console.log("MONGO_URL => ", process.env.MONGO_URL);

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URL);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
}

connectDB();

function dbconnect(collectionName) {
  const database = client.db("portfolio");
  return database.collection(collectionName);
}

// Home Route
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

// ================= NAVBAR REGISTER =================
app.post("/registerNav", upload.none(), async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    if (!name || !email || !password || !confirmPassword || !mobile) {
      return res.send({
        message: "Please enter all fields",
        status: 0,
      });
    }

    const user = dbconnect("navbar");

    const finduser = await user.findOne({ email });

    if (finduser) {
      return res.send({
        message: "User already registered",
        status: 0,
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const insertuser = await user.insertOne({
      name,
      email,
      password: hashpassword,
      mobile,
    });

    res.send({
      message: "Registration Successfully",
      status: 1,
      data: insertuser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Server Error",
      error: error.message,
    });
  }
});

// ================= LOGIN =================
app.post("/login", upload.none(), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({
        message: "Please enter email and password",
        status: 0,
      });
    }

    const user = dbconnect("navbar");

    const findemail = await user.findOne({ email });

    if (!findemail) {
      return res.send({
        message: "Email not found",
        status: 0,
      });
    }

    const matchPassword = await bcrypt.compare(
      password,
      findemail.password
    );

    if (!matchPassword) {
      return res.send({
        message: "Invalid Password",
        status: 0,
      });
    }

    // Send Mail
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Login Confirmation",
      html: `<h2>Welcome ${findemail.name}</h2>`,
    });

    res.send({
      message: "Login successful",
      status: 1,
      data: findemail,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Server Error",
      error: error.message,
    });
  }
});

// ================= PORTFOLIO CONTACT =================
app.post("/register", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.send({
        message: "Please enter all fields",
        status: 0,
      });
    }

    const user = dbconnect("portfolio");

    const insertdata = await user.insertOne({
      name,
      email,
      subject,
      message,
    });

    // Send Mail
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Confirmation Mail",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your form submitted successfully.</p>
      `,
    });

    res.send({
      message: "Registration Successful",
      status: 1,
      data: insertdata,
    });
  } catch (error) {
    console.log("REGISTER ERROR => ", error);

    res.status(500).send({
      message: "Server Error",
      error: error.message,
    });
  }
});

// ================= TOURS =================
app.post("/registers", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.send({
        message: "Please enter all fields",
        status: 0,
      });
    }

    const user = dbconnect("tours");

    const insertdata = await user.insertOne({
      name,
      email,
      subject,
      message,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Tour Booking Confirmation",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your tour booked successfully.</p>
      `,
    });

    res.send({
      message: "Tour booked successfully",
      status: 1,
      data: insertdata,
    });
  } catch (error) {
    console.log("TOUR ERROR => ", error);

    res.status(500).send({
      message: "Server Error",
      error: error.message,
    });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});