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

const client = new MongoClient(process.env.MONGO_URL);
let database;

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
    database = client.db("portfolio");
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
}

connectDB();

function dbconnect(collectionName) {
  return database.collection(collectionName);
}

function createMailTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function contactConfirmationTemplate({ name, subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Contacting Bikendra Singh</title>
</head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#34d399);padding:28px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:24px;">Thank You, ${name}!</h1>
              <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">Your message has been received successfully.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
                Thank you for reaching out through my portfolio website. I have received your message and will get back to you as soon as possible.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Subject</p>
                <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">${subject}</p>
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;white-space:pre-wrap;">${message}</p>
              </div>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
                Best regards,<br />
                <strong style="color:#059669;">Bikendra Singh</strong><br />
                Full Stack Engineer
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#ecfdf5;padding:18px 32px;text-align:center;font-size:13px;color:#64748b;">
              Portfolio Contact Form • bikendra7848@gmail.com • 8878685813
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function contactOwnerNotificationTemplate({ name, email, subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Portfolio Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">New Contact Message</h1>
              <p style="margin:8px 0 0;font-size:14px;opacity:0.85;">Someone submitted your portfolio contact form.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;"><strong>Name:</strong> ${name}</p>
              <p style="margin:0 0 12px;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#059669;">${email}</a></p>
              <p style="margin:0 0 12px;"><strong>Subject:</strong> ${subject}</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-top:16px;">
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function loginConfirmationTemplate({ name }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Login Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#059669;padding:24px 28px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">Login Successful</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;color:#334155;line-height:1.7;">
              <p style="margin:0 0 12px;">Hello <strong>${name}</strong>,</p>
              <p style="margin:0;">You have successfully logged in to your portfolio account. If this wasn't you, please secure your account immediately.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendMail({ to, subject, html }) {
  const transport = createMailTransport();
  return transport.sendMail({
    from: `"Bikendra Singh Portfolio" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
}

app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

app.post("/registerNav", upload.none(), async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    if (!name || !email || !password || !confirmPassword || !mobile) {
      return res.status(400).json({
        message: "Please enter all fields",
        status: 0,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        status: 0,
      });
    }

    const user = dbconnect("navbar");
    const finduser = await user.findOne({ email });

    if (finduser) {
      return res.status(409).json({
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
      createdAt: new Date(),
    });

    res.json({
      message: "Registration successful",
      status: 1,
      data: { insertedId: insertuser.insertedId },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
      status: 0,
      error: error.message,
    });
  }
});

app.post("/login", upload.none(), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
        status: 0,
      });
    }

    const user = dbconnect("navbar");
    const findemail = await user.findOne({ email });

    if (!findemail) {
      return res.status(404).json({
        message: "Email not found",
        status: 0,
      });
    }

    const matchPassword = await bcrypt.compare(password, findemail.password);

    if (!matchPassword) {
      return res.status(401).json({
        message: "Invalid password",
        status: 0,
      });
    }

    await sendMail({
      to: email,
      subject: "Login Confirmation - Bikendra Singh Portfolio",
      html: loginConfirmationTemplate({ name: findemail.name }),
    });

    res.json({
      message: "Login successful",
      status: 1,
      data: {
        name: findemail.name,
        email: findemail.email,
        mobile: findemail.mobile,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
      status: 0,
      error: error.message,
    });
  }
});

app.post("/register", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please enter all fields",
        status: 0,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        status: 0,
      });
    }

    const user = dbconnect("portfolio");

    const insertdata = await user.insertOne({
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
    });

    await sendMail({
      to: email,
      subject: "Thank you for contacting Bikendra Singh",
      html: contactConfirmationTemplate({ name, subject, message }),
    });

    if (process.env.EMAIL) {
      await sendMail({
        to: process.env.EMAIL,
        subject: `New Portfolio Message: ${subject}`,
        html: contactOwnerNotificationTemplate({ name, email, subject, message }),
      });
    }

    res.json({
      message: "Your message has been sent successfully. I will contact you soon!",
      status: 1,
      data: { insertedId: insertdata.insertedId },
    });
  } catch (error) {
    console.log("REGISTER ERROR => ", error);
    res.status(500).json({
      message: "Unable to send message right now. Please try again later.",
      status: 0,
      error: error.message,
    });
  }
});

app.post("/registers", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
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
      createdAt: new Date(),
    });

    await sendMail({
      to: email,
      subject: "Tour Booking Confirmation",
      html: contactConfirmationTemplate({ name, subject, message }),
    });

    res.json({
      message: "Tour booked successfully",
      status: 1,
      data: { insertedId: insertdata.insertedId },
    });
  } catch (error) {
    console.log("TOUR ERROR => ", error);
    res.status(500).json({
      message: "Server Error",
      status: 0,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
