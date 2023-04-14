const {Transaction, Wallet, User,Savings} = require('./models/Schemas');
const countryCode = require("./util/countryCode");
const { response } = require("express");
const bcrypt = require("bcrypt");
const qs = require("qs");
const axios = require("axios");
const handleMember = require("./MemberView");

const sendSMS = async (phoneNumber, message) => {
  const API_KEY = "1ee443c7d1bbe988ba87ead7b338cdc3aca397ecb471337570ac0b18b74ad7f9";
  const USERNAME = "sandbox";
  const SMS_URL = `https://api.sandbox.africastalking.com/version1/messaging`;

  try {
    const response = await axios.post(SMS_URL, qs.stringify({
      to: phoneNumber,
      message: message,
      apiKey: API_KEY,
      username: USERNAME,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey: API_KEY,
        username: USERNAME,
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};


const credentials = {
  apiKey: process.env.apiKey,
  username: process.env.username
};



const handleAdmin = async (textArray, phoneNumber) => {
  async function confirmDetails() {
    let user = await User.findOne({ number: phoneNumber });
    return user;
  }
  
  // Assigns the user to a variable for manipulation
  let user = await confirmDetails();
    let response = "";
    const level = textArray.length;

    if(level === 1){
      response = `CON Choose an option
                 1. Invite Members
                 2. Pending Loan Approvals
                 3. Loan Balances
                 4. Group Members
                `;
      return response;
    }
    if (level == 2 && textArray[1] == 1) {
      response = `CON Enter the number you want to invite to the circle`;
      return response;
    } else if (level == 3) {
      const userNumber = countryCode(textArray[2]);
      let user = await User.findOne({ number: userNumber });
      if (user) {
        let circleMember = textArray[2];
        response = `CON ${circleMember}, has been invited to join your circle.
                    1. Add to invite list`;

                    async function confirmDetails() {
                      let user = await Savings.findOne({ number: phoneNumber });
                      return user;
                    }
                
                    // Assigns the user to a variable for manipulation
                    let user = await confirmDetails();
                
                 
            
      } else {
        let circleMember = textArray[2];
        response = `CON ${circleMember}, has been invited to Pollen and join your circle.
                    1. Add to invite list`;

                    async function confirmDetails() {
                      let user = await Savings.findOne({ number: phoneNumber });
                      return user;
                    }
                
                    // Assigns the user to a variable for manipulation
                    let user = await confirmDetails();
                
                    let code = user.GroupCode;
                   
        await Savings.findOneAndUpdate(
          { GroupCode: code },
          { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
          { new: true, upsert: true }
        );
      }
      return response;
    } else if (level == 4 && textArray[3] == 1) {
      let user = await Savings.findOne({ number: phoneNumber });
      let code = user.GroupCode;
      let name = user.GroupName;
      await Savings.findOneAndUpdate(
        { GroupCode: code },
        { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
        { new: true, upsert: true }
      );


     
      response = `CON ${textArray[2]}, has been invited to join ${name} and added to the invite list`;
      return response;
    }
    
    
  //   if(level === 2 && textArray[1] === '2'){
  //     const circles = await Savings.find({Creator: phoneNumber});
  //     response = `CON 
  //   Select a circle :\n`;
  //  circles.forEach((circle, index) => {
  //     response += `${index + 1}. ${circle.GroupName}\n`;
  //   });
  //   return response;
  //   }
  //   if(level === 3){
  //     const selectedCircleIndex = parseInt(textArray[2]) - 1;
  //   const userCircles = await Savings.find({Creator: phoneNumber});
  //   const selectedCircle = userCircles[selectedCircleIndex];

  //   if (!selectedCircle || !selectedCircle.LoanRequest || !selectedCircle.LoanRequest.length) {
  //     response = `END Invalid circle or no pending loan requests.`;
  //     return response;
  //   }
    
  //   const loanRequest = selectedCircle.LoanRequest[0];
  //   const Amount = loanRequest ?  loanRequest.LoanAmount : 0;
  //   if (loanRequest.Status === 'Pending Admin Approval') {
 
  //       response = `CON Loan request details:
  //       Borrower number: ${loanRequest.BorrowerNumber}
  //       Amount: ${Amount}
  //       Reason: ${loanRequest.LoanReason}
  //       1. Approve
  //       2. Reject`;
  //       return response;
      
  //   }

  //   }if(level === 4 && textArray[3] === '1' ){
  //     const selectedCircleIndex = parseInt(textArray[2]) - 1;
  //     const userCircles = await Savings.find({Creator: phoneNumber});
  //     const selectedCircle = userCircles[selectedCircleIndex];
  
  //     if (!selectedCircle || !selectedCircle.LoanRequest || !selectedCircle.LoanRequest.length) {
  //       response = `END No Pending Loan Requests.`;
  //       return response;
  //     }
      
  //     const loanRequest = selectedCircle.LoanRequest[0];
  //     const Amount = loanRequest ?  loanRequest.LoanAmount : 0;

  //       // Add borrower number and amount to LoanBalance collection and credit borrower's wallet
  //     const borrowerNumber = loanRequest.BorrowerNumber;
  //     const loanBalance = {
  //       BorrowerNumber: loanRequest.BorrowerNumber,
  //       LoanAmount: Amount
  //     };
  //     selectedCircle.LoanBalance.push(loanBalance);

  //     const loanIndex = selectedCircle.LoanRequest.findIndex((id) => id._id === loanRequest._id);
  //     selectedCircle.LoanRequest.splice(loanIndex, 1); // remove the loan request from the array
    
  //     await selectedCircle.save();
  
  //     const borrowerWallet = await Wallet.findOne({ Number: borrowerNumber });
  //     borrowerWallet.balance += Amount;
  //     await borrowerWallet.save();
  
  //     loanRequest.Status = 'Approved';
  //     await selectedCircle.save();

  //     response =`END Loan successfully approved`;
  //     return response;
      
  //   }
    
  
};

module.exports = handleAdmin;
