import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser  from "cookie-parser";
import cloudinary from "cloudinary"
import cors from "cors";
// import helmet from "helmet";

import connectDb from "../Backend/Db/connectDB.js"
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import notifyRoute from "./routes/notify.route.js"
import { dirname } from "path";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();

// app.use(helmet());

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
//     },
//   })
// );

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
})


app.use(express.json({ limit: "5mb" })); // to parse req.body

app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));



// app.use("/api/auth", authRoute);
// app.use("/api/users", userRoute);
// app.use("/api/posts", postRoute);
// app.use("/api/notifications", notifyRoute);

try {
  app.use("/api/auth", authRoute);
} catch (err) {
  console.error("Error in authRoute:", err);
}

try {
  app.use("/api/users", userRoute);
} catch (err) {
  console.error("Error in userRoute:", err);
}

try {
  app.use("/api/posts", postRoute);
} catch (err) {
  console.error("Error in postRoute:", err);
}

try {
  app.use("/api/notifications", notifyRoute);
} catch (err) {
  console.error("Error in notifyRoute:", err);
}


// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // Safe SPA fallback for non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath);
  });
}


// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    connectDb();
})


