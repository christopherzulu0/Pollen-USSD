const express = require("express");
const router = express.Router();
const {
    MainMenu,
    Register,
    CircleSavings,
    PersonalSavings,
    SendMoney,
    WithdrawMoney,
    CheckBalance,
    unregisteredMenu,
  } = require("./menu");
  
  const {
    Savings,
  } = require("./Savings");
  const User = require("./models/user");
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  const cors = require("cors");

//   const Circle = require("./models/circle");
  const app = express();

  
  //Configuring Express
  dotenv.config();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  mongoose.set('strictQuery', true);
  const connectionString = process.env.DB_URI;
  
  //Configure MongoDB Database
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("MongoDB Running Successfully");
    })
    .catch((err) => {
      console.log({ err });
      console.log("MongoDB not Connected ");
    });

router.post("/", (req, res) => {
  // Read variables sent via POST from our SDK
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log('#', req.body);
  
  User.findOne({ number: phoneNumber })
    .then( async (user) => {
      // AUTHENTICATION PARAMETERS
      let userName;
      let userRegistered;
      let response = "";

      if (!user) {
        userRegistered = false;
      } else {
        userRegistered = true;
        userName = user.FirstName;
      }

      

      // MAIN LOGIC
      if (text == "" && userRegistered == true) {
        response = MainMenu(userName);
      } else if (text == "" && userRegistered == false) {
        response = unregisteredMenu();
      } else if (text != "" && userRegistered == false) {
        const textArray = text.split("*");
        switch (textArray[0]) {
          case "1":
            response = await Register(textArray, phoneNumber);
            break;
          default:
            response = "END Invalid choice. Please try again";
        }
      } else {
        const textArray = text.split("*");
        switch (textArray[0]) {
          case "1":
            response = await CircleSavings(textArray, phoneNumber);
            break;
          case "2": 
              response = await Savings(textArray, phoneNumber);
              break;
          case "3":
              response = await CheckBalance(textArray);
              break;
          case "4":
              response = await SendMoney(textArray, phoneNumber);
              break;
          case "5":
            response = await WithdrawMoney(textArray);
            break;  
          default:
            response = "END Invalid choice. Please try again";
        }
      }
  
  // Print the response onto the page so that our SDK can read it
  res.set("Content-Type: text/plain");
  res.send(response);
  // DONE!!!
})
.catch((err) => {
    console.log({ err });
  });
});

module.exports = router;