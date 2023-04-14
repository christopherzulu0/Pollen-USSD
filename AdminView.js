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
                 2. Pending Votes
                 3. Loan Balances
                 4. Group Members
                `;
      return response;
    }
    // if (level == 2 && textArray[1] == 1) {
    //   response = `CON Enter the number you want to invite to the circle`;
    //   return response;
    // } else if (level == 3) {
    //   const userNumber = countryCode(textArray[2]);
    //   let user = await User.findOne({ number: userNumber });
    //   if (user) {
    //     let circleMember = textArray[2];
    //     response = `CON ${circleMember}, has been invited to join your circle.
    //                 1. Add to invite list`;

    //                 async function confirmDetails() {
    //                   let user = await Savings.findOne({ number: phoneNumber });
    //                   return user;
    //                 }
                
    //                 // Assigns the user to a variable for manipulation
    //                 let user = await confirmDetails();
                
                 
            
    //   } else {
    //     let circleMember = textArray[2];
    //     response = `CON ${circleMember}, has been invited to Pollen and join your circle.
    //                 1. Add to invite list`;

    //                 async function confirmDetails() {
    //                   let user = await Savings.findOne({ number: phoneNumber });
    //                   return user;
    //                 }
                
    //                 // Assigns the user to a variable for manipulation
    //                 let user = await confirmDetails();
                
    //                 let code = user.GroupCode;
                   
    //     await Savings.findOneAndUpdate(
    //       { GroupCode: code },
    //       { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
    //       { new: true, upsert: true }
    //     );
    //   }
    //   return response;
    // } else if (level == 4 && textArray[3] == 1) {
    //   let user = await Savings.findOne({ number: phoneNumber });
    //   let code = user.GroupCode;
    //   let name = user.GroupName;
    //   await Savings.findOneAndUpdate(
    //     { GroupCode: code },
    //     { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
    //     { new: true, upsert: true }
    //   );


     
    //   response = `CON ${textArray[2]}, has been invited to join ${name} and added to the invite list`;
    //   return response;
    // }
    
    
  //   if(level === 2 && textArray[1] === '2'){
  //     const circles = await Savings.find({
  //       $or: [
  //         { 'GroupMembers.Creator': phoneNumber },
  //         { 'GroupMembers.AdminNumber1': phoneNumber },
  //         { 'GroupMembers.AdminNumber2': phoneNumber }
  //       ]
  //     });
      
  //     response = `CON 
  //   Select a circle :\n`;
  //  circles.forEach((circle, index) => {
  //     response += `${index + 1}. ${circle.GroupName}\n`;
  //   });
  //   return response;
  //   }
  //   if(level === 3){
  //     const selectedCircleIndex = parseInt(textArray[2]) - 1;
  //   const userCircles = await Savings.find({
  //     $or: [
  //       { 'GroupMembers.Creator': phoneNumber },
  //       { 'GroupMembers.AdminNumber1': phoneNumber },
  //       { 'GroupMembers.AdminNumber2': phoneNumber }
  //     ]
  //   });
  //   const selectedCircle = userCircles[selectedCircleIndex];

  //   if (selectedCircle.LoanRequest.length > 0) {
  //     const loanRequest = selectedCircle.LoanRequest[0];
  //     const totalGroupMembers = selectedCircle.GroupMembers.length;
  //     const totalVotes = loanRequest.ApprovalVotes.length + loanRequest.RejectionVotes.length;
    
  //     const user = User.findOne({number:phoneNumber});
  //     if (totalVotes < totalGroupMembers) {
  //       const hasVoted = loanRequest.ApprovalVotes.includes(user) || loanRequest.RejectionVotes.includes(user);
  //       if (!hasVoted) {
  //         response = `CON 
  //           ${selectedCircle.GroupName}
  //           a. Approve Request
  //           b. Reject Request
  //         `;
  //         return response;
  //       } else {
  //         // If the user has already voted, return a message to inform them
  //         response = `END You have already voted on this loan request.`;
  //         return response;
  //       }
  //     } else {
  //       // Check if all members have voted either for approval or rejection
  //       const totalApprovalVotes = loanRequest.ApprovalVotes.length;
  //       const totalRejectionVotes = loanRequest.RejectionVotes.length;
    
  //       if (totalApprovalVotes === totalGroupMembers) {
  //         loanRequest.Status = 'Approved';
  //         await selectedCircle.save();
  //         response = `END Loan request has been approved by all group members.`;
  //         return response;
  //       } else if (totalRejectionVotes === totalGroupMembers) {
  //         loanRequest.Status = 'Rejected';
  //         await selectedCircle.save();
  //         response = `END Loan request has been rejected by all group members.`;
  //         return response;
  //       } else if (totalRejectionVotes > totalApprovalVotes) {
  //         loanRequest.Status = 'Rejected';
  //         await selectedCircle.save();
  //         response = `END Loan request has been rejected by a majority of group members.`;
  //         return response;
  //       }
  //        else {
  //         loanRequest.Status = 'Pending';
  //         await selectedCircle.save();
  //         response = `END Loan request is pending group members' votes.`;
  //         return response;
  //       }
  //     }
  //   } else {
  //     console.log('No loan requests found.');
  //   }
    
  // }

  
    if (level === 4 && textArray[3] == 'a' ) {
      const selectedCircleIndex = parseInt(textArray[2]) - 1;
      const userCircles = await Savings.find({ $or: [
        {'GroupMembers.Creator': phoneNumber},
        {'GroupMembers.AdminNumber1': phoneNumber},
        {'GroupMembers.AdminNumber2': phoneNumber}
    ]});
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
    
    
    
    if (level === 4 && textArray[3] == 'b' ) {
      const selectedCircleIndex = parseInt(textArray[2]) - 1;
      const userCircles = await Savings.find({ $or: [
        {'GroupMembers.MemberPhoneNumber': phoneNumber},
        {'GroupMembers.Creator': phoneNumber},
        {'GroupMembers.AdminNumber1': phoneNumber},
        {'GroupMembers.AdminNumber2': phoneNumber}
    ]});
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
    
    
};

module.exports = handleAdmin;
