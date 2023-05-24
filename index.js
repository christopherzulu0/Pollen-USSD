const express = require("express");
const router = express.Router();
const {
    MainMenu,
    Register,
    SendMoney,
    WithdrawMoney,
    PersonalSavings,
    CheckBalance,
    unregisteredMenu,
    Notification
   
  } = require("./menu");

  const {CircleSavings} = require("./CircleController")
  
  const {Transaction, Wallet, User,Savings} = require('./models/Schemas');
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  const cors = require("cors");
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
  

  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log('#', req.body);
  
  
  
  User.findOne({ number: phoneNumber })
    .then( async (user) => {
      // AUTHENTICATION PARAMETERS
      let userName;
      let userRegistered;
      let response = "";
      let incurredLoan;
      let loan;
      let daysRemaining;
      let total;
      let days;
      let dueDate;
      let currentDate;
      let timeDifference;
      let day;
      let loans;
    
     

      if (!user) {
        userRegistered = false;
      }else {
        userRegistered = true;
        userName = user.FirstName;
      
        num = user.number;
        loan = await Savings.findOne({'LoanBalance.BorrowerNumber':num});
        loans = await Savings.findOne({'LoanBalance.BorrowerNumber':num});
        incurredLoan = loan ? loan.LoanBalance.find(balance => balance.BorrowerNumber === num) : null;
        incurred = incurredLoan ? incurredLoan.totalLoan : 0;
        total = incurred;
      
        //Display the of days remaining to due date
         dueDate = incurredLoan?.dueDate;
        currentDate = new Date();
       timeDifference = dueDate?.getTime() - currentDate.getTime();
        day = timeDifference ? Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) : null;
    
    
      }
      
    //Count the number of Requests
   

const userCircles = await Savings.find({
  $or: [
    { 'GroupMembers.MemberPhoneNumber': phoneNumber },
    { 'GroupMembers.Creator': phoneNumber },
    { 'GroupMembers.AdminNumber1': phoneNumber },
    { 'GroupMembers.AdminNumber2': phoneNumber }
  ]
});

let totalRequests = 0;

if (userCircles && userCircles.length > 0) {
  userCircles.forEach((circle) => {
    const loanRequests = circle.LoanRequest;
    totalRequests += loanRequests.length;
  });
}
        

      // MAIN LOGIC
      if (text == "" && userRegistered == true) {
        response = MainMenu(userName,total,day,loans,totalRequests);
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
              response = await PersonalSavings(textArray, phoneNumber);
              break;
          case "3":
              response = await CheckBalance(textArray,phoneNumber);
              break;
          case "4":
              response = await SendMoney(textArray, phoneNumber);
              break;
          case "5":
            response = await WithdrawMoney(textArray,phoneNumber);
            break;
            case "6":
              response = await Notification(textArray, phoneNumber, userName, total, days, loans, totalRequests);
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