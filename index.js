const { authenticate } = require("@google-cloud/local-auth");
const axios = require("axios");
const express = require("express");
const nodemailer = require("nodemailer");
const path=require("path");


const app = express();
require("dotenv").config()
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static(path.join(__dirname+"public")));

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const localAuth = await authenticate({
      scopes: [
        "https://www.googleapis.com/auth/blogger",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
      ],
      keyfilePath:
        "C:/mayank-imp/fetching gmail using javascript and gmail api/keys/keys.json",
    });
    let messageData = [];
    const accessToken = localAuth.credentials["access_token"];
    //const refreshToken = localAuth.credentials['refresh_token'];
    console.log(localAuth.credentials);
    const maxResults = 5;
    // Step 1: Fetch the list of message IDs
    const response = await axios.get(
      `https://www.googleapis.com/gmail/v1/users/mkjam.007@gmail.com/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const messageIds = response.data.messages.map((message) => message.id);

    // Step 2: Fetch details of each message by its ID
    let cleanedData;
    for (const messageId of messageIds) {
      const messageResponse = await axios.get(
        `https://www.googleapis.com/gmail/v1/users/mkjam.007@gmail.com/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      messageData.push(messageResponse.data);
        console.log(messageResponse.data);
      cleanedData = messageData.map((msg) => {
        let obj = {
            id:msg.id,
            tags:msg.labelIds,
          sub:
            msg.payload.headers.find((header) => header.name === "Subject")
              ?.value || "No Subject",
          msgData: msg.snippet,
          to:
            msg.payload.headers.find((header) => header.name === "To")?.value ||
            "No To",
          date:
            msg.payload.headers.find((header) => header.name === "Date")
              ?.value || "No Date",
          from:
            msg.payload.headers.find((header) => header.name === "From")
              ?.value || "No From",
        };
        return obj;
      });
      //console.log(cleanedData);
    }
    console.log(messageData);
    return res.render("mail", { cleanedData });
  } catch (error) {
    return res.status(500).send("Error fetching Gmail emails:", error);
  }
});

app.post("/send-email/:email", async (req, res) => {
  try {
    // Authenticate using the same credentials as in your existing code
    const recievers_email=req.params.email
    const localAuth = await authenticate({
      scopes: [
        "https://www.googleapis.com/auth/blogger",
        "https://mail.google.com/"
      ],
      keyfilePath:
        "C:/mayank-imp/fetching gmail using javascript and gmail api/keys/keys.json",
    });

    // Get the access token
    const accessToken = localAuth.credentials["access_token"];
    //const refreshToken = localAuth.credentials["refresh_token"];
//console.log(accessToken);
    // Create a transport for sending emails using Nodemailer

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "mkjam.007@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
       
        accessToken:accessToken
      },
    });
console.log(recievers_email);
    // Compose the email
    const mailOptions = {
      from: "mkjam.007@gmail.com",
      to:recievers_email,
      subject: "Subject of the email",
      text: "This is testing email",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
          return res.status(500).send(error)
        } else {
          console.log("Email sent successfully!");
          return res.status(200).send("Mail Sent Succesfully!")
        }
      });
  } catch (error) {
    console.log("Error sending email:", error);
    return res.status(500).send("Error sending email:", error);
  }
});

const PORT = 3001; // Use a port number above 1024

app.listen(PORT, () => {
  console.log("Server is listening to port:", PORT);
});
