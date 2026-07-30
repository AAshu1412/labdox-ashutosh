require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const app = express();
const connectDb = require("./utils/db");
const errorMiddleWare = require("./middlewares/error-middleware");
const authRoute = require("./router/auth-router");
const oauth2Router = require("./router/google-oauth-router");
const verificationRoute = require("./router/verification-router");
const adminRoute = require("./router/admin-router");

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/oauth", oauth2Router);
app.use("/api/verify", verificationRoute);
app.use("/api/admin", adminRoute);

app.use(errorMiddleWare);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
