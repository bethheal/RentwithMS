// testEmail.js

import dotenv from "dotenv";
import { sendVerificationEmail } from "./server/services/mailService.js";


dotenv.config();

await sendVerificationEmail(
  "test@example.com",
  "123456"
);

console.log("Email sent!");
console.log({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  user: process.env.MAIL_USER,
});