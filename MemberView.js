const {Transaction, Wallet, User,Savings,LoanRequest} = require('./models/Schemas');
const handleDebts = require("./CircleMenu");
const countryCode = require("./util/countryCode");
const { response } = require("express");
const bcrypt = require("bcrypt");
const qs = require("qs");
const axios = require("axios");

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



const handleMember = async (textArray, phoneNumber) => {
  let response = '';
  const level = textArray.length;
  const user = await User.findOne({ phoneNumber });

  // If no circles exist, show options to create or join a circle
  const circles = await Savings.find();
  if (!circles.length) {
    response = `CON 
    No circles available.
    1. Create a circle
    2. Join a circle
    `;
    return response;
  }if (level === 1) {
    // Show a list of circles the user belongs to
    const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });

    if (!userCircles.length) {
      response = `CON 
      You don't belong to any circle.
      1. Join a circle
      2. Create a circle
      `;
      return response;
    }

    response = `CON 
    Select a circle :\n`;
    userCircles.forEach((circle, index) => {
      response += `${index + 1}. ${circle.GroupName}\n`;
    });
    response += `${userCircles.length + 1}. Join a circle\n`;
    response += `${userCircles.length + 2}. Create a circle\n`;
    return response;
  }
  if (level === 2) {
    // Show the details of the selected circle
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
    const selectedCircle = userCircles[selectedCircleIndex];
    response = `END Circle details for ${selectedCircle.GroupName}\n`;
    response += `Admin name: ${selectedCircle.AdminName}\n`;
    response += `Deposit goal: ${selectedCircle.DepositGoal}\n`;
    response += `Penalty: ${selectedCircle.Penalty}\n`;
  


    //Check if the user has already voted
if (selectedCircle.LoanRequest.length>0) {
  // Check if the user has already voted
  const hasVoted = selectedCircle.LoanRequest.some(request => 
    request.ApprovalVotes.includes(phoneNumber) || request.RejectionVotes.includes(phoneNumber)
  );
  if (!hasVoted) {
    response = `CON 
      ${selectedCircle.GroupName}
      1. Approve Request
      2. Reject Request
    `;
    return response;
  } else {
    // If the user has already voted, return a message to inform them
    response = `END You have already voted on this loan request.`;
    return response;
  }
} else {
  console.log('No loan requests found.');
}


// console.log(loanRequest);
    
   //Check if the user is in debt
    // const userDebt = selectedCircle.InDebtMembers.find(member => member.MemberPhoneNumber === phoneNumber);
    // const amount = userDebt ? userDebt.Amount : 0;
    // if (userDebt) {
    //   response = `CON 
    //     ${selectedCircle.GroupName} - ${amount}
    //     1. Repay Balance
    //   `;
    //   return response;
    // } else {
    //   // Push user to InDebtMembers with an initial debt amount of 0
    //   const totalBalance = selectedCircle.circleBalance?.reduce(
    //     (sum, member) => sum + member.Balance,
    //     0
    //   ) ?? 0;
    //   response = `CON 
    //     ${selectedCircle.GroupName} - $ ${totalBalance}
    //     1. Deposit Fund
    //     2. Request Loan
    //     3. Balances
    //     4. Other Actions
    //   `;
    // }
  
    // ... other circle details
    return response;
  }
//   if (level === 3 && textArray[2] === '1') {
//     const selectedCircleIndex = parseInt(textArray[1]) - 1;
//     const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
//     const selectedCircle = userCircles[selectedCircleIndex];
  

//     async function getBalance() {
//       const user = await User.findOne({ number: phoneNumber });
//       const wallet = await Wallet.findOne({ user: user._id }).populate('transactions');
    
//       if (!wallet) {
//         return 0;
//       }
    
//       return wallet.balance;
//     }
    

    
//     const balance = await getBalance(user._id);
//     console.log(balance)
    
//     // Prompt user to enter deposit amount
//     response = `CON 
//       Deposit funds to ${selectedCircle.GroupName}
//       Available to deposit:
//       $ ${balance}`;
  
//     return  response;
//   }
  
//   if (level === 4 && textArray[2] === '1') {
//     const selectedCircleIndex = parseInt(textArray[1]) - 1;
//     const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
//     const selectedCircle = userCircles[selectedCircleIndex];
    
//     const depositAmount = parseFloat(textArray[3]);
  
//     // Check if the deposit amount is valid
//     if (isNaN(depositAmount) || depositAmount <= 0) {
//       response = `CON 
//         Invalid deposit amount. Please enter a valid amount:
//         $`;
//       return response;
//     }
  
//     // Retrieve the user's wallet
//     const user = await User.findOne({ number: phoneNumber });
//     const userWallet = await Wallet.findOne({ user: user._id });
  
//     // Check if the deposit amount is greater than the user's wallet balance or if it is equal to 0
//     if (depositAmount > userWallet.balance || depositAmount === 0) {
//       response = `CON 
//         Insufficient funds or invalid deposit amount. Your wallet balance is $${userWallet.balance}.
//         Please enter a valid deposit amount:
//         $`;
//       return response;
//     }
  
   
  
//     // Prompt the user to enter their PIN
//     response = `CON 
//       Please enter your PIN to complete this transaction:
//       `;
//     return response;
//   }
  
//     // Validate the entered PIN
//   if (level === 5 && textArray[2] === '1' && textArray[4]) {
//     const enteredPin = textArray[4];
//     // Retrieve the user's PIN from the database
//     const user = await User.findOne({ number: phoneNumber });
//     if (user.pin === enteredPin) {
//        const selectedCircleIndex = parseInt(textArray[1]) - 1;
//     const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber});
//     const selectedCircle = userCircles[selectedCircleIndex];

//     const depositAmount = parseFloat(textArray[3]);
  
//         const userWallet = await Wallet.findOne({ user: user._id });
//       // Update the user's wallet and circle balance with the deposit amount
//       userWallet.balance -= depositAmount;
//        // Create a new transaction object
//     const transaction = new Transaction({
//       sender: user._id,
//       receiver: selectedCircle._id,
//       amount: depositAmount,
//     });
  
//     // Add the transaction to the user's transaction array
//     userWallet.transactions.push(transaction);

//         if (!Array.isArray(selectedCircle.circleBalance)) {
//       // Initialize CircleBalance as an empty array
//       selectedCircle.circleBalance = [];
//     }
//      const memberIndex = selectedCircle.circleBalance.findIndex((member) => member.MemberPhoneNumber === phoneNumber);
//       if (memberIndex === -1) {
//       // Add new member to the circle
//       selectedCircle.circleBalance.push({
//         MemberPhoneNumber: phoneNumber,
//         Balance: depositAmount,
//       });
//     } else {
//       // Update the existing member balance
//       selectedCircle.circleBalance[memberIndex].Balance += depositAmount;
//     }
//       // Save the updated wallet and circle balance
//       await userWallet.save();
//       await selectedCircle.save();
  
//       // Display success message to the user
//       response = `END 
//         Your Deposit of $${depositAmount} was successful to ${selectedCircle.GroupName}. Your new balance in ${selectedCircle.GroupName}.
//          You will receive an sms if we encounter any issues.
//         `;
  
//       return response;
//     } else {
//       // Display error message to the user
//       response = `END 
//         Invalid PIN. Please try again.
//         `;
//       return response;
//     }
//   }
  
//   if (level === 3 && textArray[2] === '2' ) {
//       response = `CON Why do you need a loan?
//                   Write a description..
//                 `;
//       return response;
    
//   } 
//   if (level === 4 && textArray[2] === '2' ) {
//     response = `CON Enter the amount you want to borrow
//               `;
//     return response;
  
// } 
// if (level === 5 && textArray[2] === '2' && textArray[3] && textArray[4]) {
//   const selectedCircleIndex = parseInt(textArray[1]) - 1;
//   const userCircles = await Savings.find({
//     $or: [
//       { 'GroupMembers.MemberPhoneNumber': phoneNumber },
//       { 'LoanRequest.MemberPhoneNumber': phoneNumber }
//     ]
//   });
//   const selectedCircle = userCircles[selectedCircleIndex];

//   const loanReason = textArray[3];
//   const loanAmount = parseFloat(textArray[4]);

//   // Check if the loan amount is valid
//   if (isNaN(loanAmount) || loanAmount <= 0) {
//     response = `CON 
//       Invalid loan amount. Please enter a valid amount:
//       $`;
//     return response;
//   }




//   // Check if the user has an existing loan request
//  // Check if the user has an existing loan request
// // const hasExistingLoanRequest = LoanRequest.find({MemberPhoneNumber:phoneNumber});

// // if (hasExistingLoanRequest) {
// //   response = `CON 
// //     You already have a pending loan request. Please wait for approval before requesting another loan.
// //   `;
// //   return response;
// // }


  //Check if the user has enough savings in the circle to request the loan
//   const totalBalance = selectedCircle.circleBalance?.reduce(
//     (sum, member) => sum + member.Balance,
//     0
//   ) ?? 0;
  
//   if (loanAmount > totalBalance) {
//     response = `CON 
//       Insufficient savings in the circle to request a loan. Your available savings is $${totalBalance}.
//       Please enter a valid loan amount:
//       $`;
//     return response;
//   }

//   // Add the loan request to the circle's LoanRequests array
//   const loanRequest = {
//     BorrowerNumber: phoneNumber,
//     LoanReason: loanReason,
//     LoanAmount: loanAmount,
//     ApprovalVotes: [],
//     RejectionVotes: [],
//     Approved: false,
//     Rejected: false
//   };
//   selectedCircle.LoanRequest.push(loanRequest);
//   await selectedCircle.save();

//   // Send a notification to all circle members to vote on the loan request
//   selectedCircle.GroupMembers.forEach(member => {
//     if (member.MemberPhoneNumber !== phoneNumber) {
//       // TODO: Implement code to send a notification to each member
//     }
//   });

//   response = `END 
//     Your loan request has been submitted for approval. You will receive a notification when it has been approved or rejected.
//   `;
//   return response;
// }
  


if(level === 3 && textArray[2] == '1') {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
  const selectedCircle = userCircles[selectedCircleIndex];

  // const id = selectedCircle.LoanRequest.find((id) => id._id === id._id);
 
  try {
    const loanRequest = selectedCircle.LoanRequest.find((id) => id._id === id._id);
       
    if (!loanRequest) {
      response = `END Loan request not found.`;
      return response;
    }
  
    loanRequest.ApprovalVotes.push(phoneNumber);
    const totalApprovalVotes = loanRequest.ApprovalVotes.length;
    const totalGroupMembers = selectedCircle.GroupMembers.length;
  
    if (totalApprovalVotes >= totalGroupMembers) { // check if all group members have voted
      const loanAmount = loanRequest ? loanRequest.LoanAmount: 0;
      const borrowerIndex = selectedCircle.circleBalance.findIndex(
        (member) => member.MemberPhoneNumber === loanRequest.BorrowerNumber
      );
  
      console.log(borrowerIndex);

      if (borrowerIndex === -1) {
       
        response = `END Error: borrower not found in circle balance.`;
        return response;
      }
    

      if (selectedCircle.circleBalance[borrowerIndex].Balance < loanAmount) {
        response = `END Error: borrower does not have sufficient balance to repay loan.`;
        return response;
      }
  
      selectedCircle.circleBalance[borrowerIndex].Balance -= loanAmount;
      const borrower = await Wallet.findOneAndUpdate(
        { MemberPhoneNumber: loanRequest.BorrowerNumber },
        { $inc: { balance: loanAmount } },
        { new: true }
      );
  
      const loanBalance = {
        BorrowerNumber: loanRequest.BorrowerNumber,
        LoanAmount: loanAmount
      };
      selectedCircle.LoanBalance.push(loanBalance);
  
      const loanIndex = selectedCircle.LoanRequest.findIndex((id) => id._id === loanRequest._id);
      selectedCircle.LoanRequest.splice(loanIndex, 1); // remove the loan request from the array
    
      await selectedCircle.save();
  
      response = `END Loan request approved by all group members for the sum of ${loanAmount}`;
      return response;
    } else {
      await selectedCircle.save();
      response = `CON 
        ${selectedCircle.GroupName}
        1. Approve Request
        2. Reject Request
      `;
      return response;
    }
  } catch (error) {
    console.error(error);
    response = `END Error: ${error.message}`;
    return response;
  }
}

if(level === 3 && textArray[2] == 2) {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
  const selectedCircle = userCircles[selectedCircleIndex];
  const loanRequest = selectedCircle.LoanRequest.find(lr => lr.MemberPhoneNumber === phoneNumber);
  
  if (loanRequest) {
    loanRequest.RejectionVotes.push(phoneNumber);
    const totalRejectionVotes = loanRequest.RejectionVotes.length;
    const totalGroupMembers = selectedCircle.GroupMembers.length;
    if (totalRejectionVotes >= totalGroupMembers / 2) {
      selectedCircle.LoanRequest = null;
      await selectedCircle.save();
      response = `END Loan request rejected.`;
      return response;
    } else {
      await selectedCircle.save();
      response = `END Loan request rejected. Total rejection votes: ${totalRejectionVotes}/${totalGroupMembers / 2}`;
      return response;
    }
  } else {
    response = `END Loan request not found.`;
    return response;
  }
}


 
  
  

  
  
  
  

  // Handle join circle and create circle options here
  // ...
};



module.exports = handleMember;
