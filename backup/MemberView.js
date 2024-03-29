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
  

// Check if the user has already voted
if (selectedCircle.LoanRequest.length > 0) {
  const loanRequest = selectedCircle.LoanRequest[0];
  const totalGroupMembers = selectedCircle.GroupMembers.length;
  const totalVotes = loanRequest.ApprovalVotes.length + loanRequest.RejectionVotes.length;

  const user = User.findOne({number:phoneNumber});
  if (totalVotes < totalGroupMembers) {
    const hasVoted = loanRequest.ApprovalVotes.includes(user) || loanRequest.RejectionVotes.includes(user);
    if (!hasVoted) {
      response = `CON 
        ${selectedCircle.GroupName}
        a. Approve Request
        b. Reject Request
      `;
      return response;
    } else {
      // If the user has already voted, return a message to inform them
      response = `END You have already voted on this loan request.`;
      return response;
    }
  } else {
    // Check if all members have voted either for approval or rejection
    const totalApprovalVotes = loanRequest.ApprovalVotes.length;
    const totalRejectionVotes = loanRequest.RejectionVotes.length;

    if (totalApprovalVotes === totalGroupMembers) {
      loanRequest.Status = 'Approved';
      await selectedCircle.save();
      response = `END Loan request has been approved by all group members.`;
      return response;
    } else if (totalRejectionVotes === totalGroupMembers) {
      loanRequest.Status = 'Rejected';
      await selectedCircle.save();
      response = `END Loan request has been rejected by all group members.`;
      return response;
    } else if (totalRejectionVotes > totalApprovalVotes) {
      loanRequest.Status = 'Rejected';
      await selectedCircle.save();
      response = `END Loan request has been rejected by a majority of group members.`;
      return response;
    } 
    //else if (totalRejectionVotes === totalApprovalVotes) {
    //   loanRequest.Status = 'Pending Admin Approval';
    //   await selectedCircle.save();
    //   response = `END Loan request is pending admin approval.`;
    //   return response;
    // }
     else {
      loanRequest.Status = 'Pending';
      await selectedCircle.save();
      response = `END Loan request is pending group members' votes.`;
      return response;
    }
  }
} else {
  console.log('No loan requests found.');
}



// console.log(loanRequest);
    
    //Check if the user is in debt
    const userd = User.findOne({number:phoneNumber});
    const userDebt = selectedCircle.LoanBalance.find((member) => member.BorrowerNumber === userd);
    // console.log(JSON.stringify(selectedCircle.LoanBalance))
    console.log(userDebt)
    if (userDebt) {
      const amount = userDebt.LoanAmount;
      console.log(amount)
      response = `CON 
        ${selectedCircle.GroupName} - ${amount}
        r. Repay Balance
      `;
      return response;
    } else {
      // Push user to InDebtMembers with an initial debt amount of 0
      const totalBalance = selectedCircle.circleBalance?.reduce(
        (sum, member) => sum + member.Balance,
        0
      ) ?? 0;
      response = `CON 
        ${selectedCircle.GroupName} - $ ${totalBalance}
        1. Deposit Fund
        2. Request Loan
        3. Balances
        4. Other Actions 
      `;
      return response;
    }
    
    
    // ... other circle details
    return response;
  }
  if (level === 3 && textArray[2] === '1' ) {
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
    const selectedCircle = userCircles[selectedCircleIndex];
  

    async function getBalance() {
      const user = await User.findOne({ number: phoneNumber });
      const wallet = await Wallet.findOne({ user: user._id }).populate('transactions');
    
      if (!wallet) {
        return 0;
      }
    
      return wallet.balance;
    }
    

    
    const balance = await getBalance(user._id);
    console.log(balance)
    
    // Prompt user to enter deposit amount
    response = `CON 
      Deposit funds to ${selectedCircle.GroupName}
      Available to deposit:
      $ ${balance}`;
  
    return  response;
  }
  
  if (level === 4 && textArray[2] === '1') {
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
    const selectedCircle = userCircles[selectedCircleIndex];
    
    const depositAmount = parseFloat(textArray[3]);
  
    // Check if the deposit amount is valid
    if (isNaN(depositAmount) || depositAmount <= 0) {
      response = `CON 
        Invalid deposit amount. Please enter a valid amount:
        $`;
      return response;
    }
  
    // Retrieve the user's wallet
    const user = await User.findOne({ number: phoneNumber });
    const userWallet = await Wallet.findOne({ user: user._id });
  
    // Check if the deposit amount is greater than the user's wallet balance or if it is equal to 0
    if (depositAmount > userWallet.balance || depositAmount === 0) {
      response = `CON 
        Insufficient funds or invalid deposit amount. Your wallet balance is $${userWallet.balance}.
        Please enter a valid deposit amount:
        $`;
      return response;
    }
  
   
  
    // Prompt the user to enter their PIN
    response = `CON 
      Please enter your PIN to complete this transaction:
      `;
    return response;
  }
  
    // Validate the entered PIN
  if (level === 5 && textArray[2] === '1' && textArray[4]) {
    const enteredPin = textArray[4];
    // Retrieve the user's PIN from the database
    const user = await User.findOne({ number: phoneNumber });
    if (user.pin === enteredPin) {
       const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber});
    const selectedCircle = userCircles[selectedCircleIndex];

    const depositAmount = parseFloat(textArray[3]);
  
        const userWallet = await Wallet.findOne({ user: user._id });
      // Update the user's wallet and circle balance with the deposit amount
      userWallet.balance -= depositAmount;
       // Create a new transaction object
    const transaction = new Transaction({
      sender: user._id,
      receiver: selectedCircle._id,
      amount: depositAmount,
    });
  
    // Add the transaction to the user's transaction array
    userWallet.transactions.push(transaction);

        if (!Array.isArray(selectedCircle.circleBalance)) {
      // Initialize CircleBalance as an empty array
      selectedCircle.circleBalance = [];
    }
     const memberIndex = selectedCircle.circleBalance.findIndex((member) => member.MemberPhoneNumber === phoneNumber);
      if (memberIndex === -1) {
      // Add new member to the circle
      selectedCircle.circleBalance.push({
        MemberPhoneNumber: phoneNumber,
        Balance: depositAmount,
      });
    } else {
      // Update the existing member balance
      selectedCircle.circleBalance[memberIndex].Balance += depositAmount;
    }
      // Save the updated wallet and circle balance
      await userWallet.save();
      await selectedCircle.save();
  
      // Display success message to the user
      response = `END 
        Your Deposit of $${depositAmount} was successful to ${selectedCircle.GroupName}. Your new balance in ${selectedCircle.GroupName}.
         You will receive an sms if we encounter any issues.
        `;
  
      return response;
    } else {
      // Display error message to the user
      response = `END 
        Invalid PIN. Please try again.
        `;
      return response;
    }
  }
  
  if (level === 3 && textArray[2] === '2' ) {
      response = `CON Why do you need a loan?
                  Write a description..
                `;
      return response;
    
  } 
  if (level === 4 && textArray[2] === '2' ) {
    response = `CON Enter the amount you want to borrow
              `;
    return response;
  
} 
if (level === 5 && textArray[2] === '2' && textArray[3] && textArray[4]) {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'LoanRequest.MemberPhoneNumber': phoneNumber }
    ]
  });
  const selectedCircle = userCircles[selectedCircleIndex];

  const loanReason = textArray[3];
  const loanAmount = parseFloat(textArray[4]);

  // Check if the loan amount is valid
  if (isNaN(loanAmount) || loanAmount <= 0) {
    response = `CON 
      Invalid loan amount. Please enter a valid amount:
      $`;
    return response;
  }





      // const hasExistingLoanRequest = LoanBalance.find({BorrowerNumber:phoneNumber});

      // if (hasExistingLoanRequest) {
      //   response = `CON 
      //     You already have a pending balance.Pay to apply for another loan.
      //   `;
      //   return response;
      // }


 // Check if the user has enough savings in the circle to request the loan
  const totalBalance = selectedCircle.circleBalance?.reduce(
    (sum, member) => sum + member.Balance,
    0
  ) ?? 0;
  
  if (loanAmount > totalBalance) {
    response = `CON 
      Insufficient savings in the circle to request a loan. Your available savings is $${totalBalance}.
      Please enter a valid loan amount:
      $`;
    return response;
  }

  // Add the loan request to the circle's LoanRequests array
  const loanRequest = {
    BorrowerNumber: phoneNumber,
    LoanReason: loanReason,
    LoanAmount: loanAmount,
    ApprovalVotes: [],
    RejectionVotes: [],
    Approved: false,
    Rejected: false
  };
  selectedCircle.LoanRequest.push(loanRequest);
  await selectedCircle.save();

  // Send a notification to all circle members to vote on the loan request
  selectedCircle.GroupMembers.forEach(member => {
    if (member.MemberPhoneNumber !== phoneNumber) {
      // TODO: Implement code to send a notification to each member
    }
  });

  response = `END 
    Your loan request has been submitted for approval. You will receive a notification when it has been approved or rejected.
  `;
  return response;
}

if (level === 3 && textArray[2] == 'a' ) {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
  const selectedCircle = userCircles[selectedCircleIndex];
  const loanRequest = selectedCircle.LoanRequest.find((id) => id._id === id._id);

  if (!loanRequest) {
    response = `END Loan request not found.`;
    return response;
  }

  if (loanRequest.Status === 'Approved' || loanRequest.Status === 'Rejected') {
    response = `END Loan request has already been processed.`;
    return response;
  }

  loanRequest.ApprovalVotes.push(phoneNumber);
  const totalApprovalVotes = loanRequest.ApprovalVotes.length;
  const totalRejectionVotes = loanRequest.RejectionVotes.length;
  const totalGroupMembers = selectedCircle.GroupMembers.length;

  if (totalRejectionVotes > totalApprovalVotes) {
    loanRequest.Status = 'Rejected';
    await selectedCircle.save();
    response = `END Loan request has been rejected by a majority of group members.`;
    return response;
  } else if (totalRejectionVotes === totalApprovalVotes) {
    loanRequest.Status = 'Pending Admin Approval';
    await selectedCircle.save();
    response = `END Loan request has been neither approved nor rejected by all group members. It is now pending admin approval.`;
    return response;
  } else {
    if (totalApprovalVotes > Math.floor(totalGroupMembers / 2)) {
      loanRequest.Status = 'Approved';

      const loanAmount = loanRequest ? loanRequest.LoanAmount: 0;
      const borrowerIndex = selectedCircle.circleBalance.findIndex(
        (member) => member.MemberPhoneNumber === loanRequest.BorrowerNumber
      );
  
      

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
      selectedCircle.LoanRequest.splice(loanIndex, 1);

      await selectedCircle.save();
      response = `END Loan request has been approved by a majority of group members.`;
      return response;
    } else {
      await selectedCircle.save();
      response = `END Your vote has been recorded. Loan request is still pending.`;
      return response;
    }
  }
}



if (level === 3 && textArray[2] == 'b' ) {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 'GroupMembers.MemberPhoneNumber': phoneNumber });
  const selectedCircle = userCircles[selectedCircleIndex];
  const loanRequest = selectedCircle.LoanRequest.find((id) => id._id === id._id);
  console.log(loanRequest)
  if (!loanRequest) {
    response = `END Loan request not found.`;
    return response;
  }

  if (loanRequest.Status === 'Approved' || loanRequest.Status === 'Rejected') {
    response = `END Loan request has already been processed.`;
    return response;
  }

  loanRequest.RejectionVotes.push(phoneNumber);

  const totalApprovalVotes = loanRequest.ApprovalVotes.length;
  const totalRejectionVotes = loanRequest.RejectionVotes.length;
  const totalGroupMembers = selectedCircle.GroupMembers.length;

  // check if all group members have voted
  if (totalApprovalVotes + totalRejectionVotes === totalGroupMembers) {
    if (totalRejectionVotes > totalApprovalVotes) {
      loanRequest.Status = 'Rejected';
      const loanIndex = selectedCircle.LoanRequest.findIndex((id) => id._id === loanRequest._id);
      selectedCircle.LoanRequest.splice(loanIndex, 1); // remove the loan request from the array
      await selectedCircle.save();
      response = `END Loan request has been rejected by a majority of group members.`;
      return response;
    } else if (totalRejectionVotes === totalApprovalVotes) {
      loanRequest.Status = 'Pending Admin Approval';
      await selectedCircle.save();
      response = `END Loan request is pending admin approval.`;
      return response;
    } else {
      await selectedCircle.save();
      response = `END Loan request rejected by a majority of group members of the sum of ${loanAmount}`;
      return response;
    }
  } else {
    await selectedCircle.save();
    response = `CON Thank you for your vote. ${totalGroupMembers - totalApprovalVotes - totalRejectionVotes} member(s) left to vote.`;
    return response;
  }
}



 
  
  

  
  
  
  

  // Handle join circle and create circle options here
  // ...
};



module.exports = handleMember;
