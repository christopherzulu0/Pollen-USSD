const {Transaction, Wallet, User,Savings,LoanRequest} = require('./models/Schemas');
const countryCode = require("./util/countryCode");
const { response } = require("express");
const bcrypt = require("bcrypt");
const qs = require("qs");
const axios = require("axios");


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
    const userCircles = await Savings.find({
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
    });
    

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

    return response;
  }
  
  if (level === 2) {

   

    // Show the details of the selected circle
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
     });
    const selectedCircle = userCircles[selectedCircleIndex];

  

// Check if the user has already voted
if (selectedCircle.LoanRequest.length > 0) {
  const loanRequest = selectedCircle.LoanRequest[0];
  const totalGroupMembers = selectedCircle.GroupMembers.length;
  const totalVotes = loanRequest.ApprovalVotes.length + loanRequest.RejectionVotes.length;

  const type = loanRequest.LoanReason;
  const name = loanRequest.Name;
  const DebtorEarns = loanRequest.BorrowerNumber;
  const months = loanRequest.ProposedMonths;
  const amount = loanRequest.LoanAmount;
  const user = await User.findOne({number:phoneNumber});
  const member = user.number;

  //Get Member Contributed Balance
  const userd = await User.findOne({ number: phoneNumber });
    const ContributedNumber = userd.number;
    const contributedCircle = selectedCircle.MemberContribution.findIndex((member) => member.MemberPhoneNumber === DebtorEarns);
    const availableContribution = selectedCircle.MemberContribution[contributedCircle];
    const debtorBalance = availableContribution ? availableContribution.Contributed:0;
    

  // Get Member Stats Data
  const Stats = selectedCircle.MemberStats.findIndex((member) => member.MemberPhoneNumber === DebtorEarns);
  console.log("StatsNumber:",Stats.MemberPhoneNumber)
  const StatsData = selectedCircle.MemberStats[Stats];
  const Paid_Loans = StatsData ? StatsData.PaidLoans : 0;
  const Late = StatsData ? StatsData.LatePayments : 0;
  const GoalsMets = StatsData ? StatsData.GoalsMet : 0;
  const Amount =   StatsData ? StatsData.Amount : 0;


  if (totalVotes < totalGroupMembers) {
    const hasVoted = loanRequest.ApprovalVotes.includes(member) || loanRequest.RejectionVotes.includes(member);
   
    //Member contribution
    
    if (!hasVoted) {
      response = `CON <span style="color:blue">Loan Request</span>
  <b>${name}</b>,requested for <b>K${amount}</b>
    Proposed Duration: <b>${months} Months</b>

    <b>${name} Stats</b>
    Circle Deposits:        <b>K${debtorBalance}</b>
    Goals Met:              <b>${GoalsMets}</b>
    Borrow History:         <b>K${Amount}</b>
    Loans Paid:             <b>${Paid_Loans}</b>(<b>${Late}</b> Late)

    a. <span style="color:indigo">Vote Yes</span>                            
    b. <span style="color:red">Vote No</span>
      `;
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
     else {
      loanRequest.Status = 'Pending';
      await selectedCircle.save();
      response = `END Loan request is pending group members' votes.`;
      return response;
    }
  }
} 
 
// console.log(loanRequest);
  
const selected = userCircles[selectedCircleIndex];

// Push user to InDebtMembers with an initial debt amount of 0
const circleBalances = Object.values(selected.circleBalance);
const totalBalance = circleBalances.reduce((sum, member) => sum + member.Balance,0);
const totalInterest = circleBalances.reduce((sum, member) => sum + member.LoanInterest, 0);
const totalInterestPercentage = (totalInterest * 100).toFixed(2) + "%";

const contributions = Object.values(selected.MemberContribution);
const TotalEarned =contributions.reduce((sum, member) => sum + member.Earnings,0);

const allTotal = totalBalance + TotalEarned;


const userd = await User.findOne({number:phoneNumber});
const names = userd.FirstName;
const borrowerNumb = userd.number;
const userDebt = selectedCircle.LoanBalance.find((member) => member.BorrowerNumber ===  borrowerNumb);

const Loan = Object.values(selectedCircle.LoanBalance);
const LentOut = Loan.reduce((sum, member) => sum + member.totalLoan,0);

const totalBalanced =userDebt? userDebt.totalLoan:0;
// const totalBalances = userDebt? userDebt.LoanInterest:0;

const totalpayment =totalBalanced;

if (userDebt) {
  response = `CON 
  <b>${selected.GroupName} Group</b>
  Balance: <u>K<b>${totalBalance}</b></u>
  Lent Out: <u>K<b>${LentOut}</b></u>
  Interest Earned: <u><b>${totalInterest}</b></u>
    1. Deposit Fund
    2. Request Loan
    3. Group Balances
    4. Loan Balance
    5. Other Actions (Admins Only)
    6. Repay Loan(<b>K${totalpayment}</b>)
    0. Go Back
  `;
   return response;
} else {
  response = `CON 
  <b>${selected.GroupName} Group</b>
    Balance: <u>K<b>${totalBalance}</b></u>
    Lent Out: <u>K<b>${LentOut}</b></u>
    Interest Earned: <u><b>${totalInterest}</b></u>
    1. Deposit Fund
    2. Request Loan
    3. Group Balances
    4. Loan Balance
    5. Other Actions (Admins Only)
    0. Go Back
  `;
  return response;

  
}

  }
  if (level === 3 && textArray[2] === '1' ) {
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
     });
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
      K <b>${balance}</b>
      `;
  
    return  response;
  }
  
  if (level === 4 && textArray[2] === '1') {
    const selectedCircleIndex = parseInt(textArray[1]) - 1;
    const userCircles = await Savings.find({ 
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
    });
    const selectedCircle = userCircles[selectedCircleIndex];
    
    const depositAmount = parseFloat(textArray[3]);
  
    // Check if the deposit amount is valid
    if (isNaN(depositAmount) || depositAmount <= 0) {
      response = `CON 
        Invalid deposit amount. Please enter a valid amount:
        K`;
      return response;
    }
  
    // Retrieve the user's wallet
    const user = await User.findOne({ number: phoneNumber });
    const userWallet = await Wallet.findOne({ user: user._id });
  
    // Check if the deposit amount is greater than the user's wallet balance or if it is equal to 0
    if (depositAmount > userWallet.balance || depositAmount === 0) {
      response = `CON 
        Insufficient funds or invalid deposit amount. Your wallet balance is K<b>${userWallet.balance}</b>.
        Please enter a valid deposit amount:
        K`;
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
        const userCircles = await Savings.find({
          $or: [
            { 'GroupMembers.MemberPhoneNumber': phoneNumber },
            { 'GroupMembers.Creator': phoneNumber },
            { 'GroupMembers.AdminNumber1': phoneNumber },
            { 'GroupMembers.AdminNumber2': phoneNumber },
          ],
        });
        const selectedCircle = userCircles[selectedCircleIndex];
    
        const depositAmount = parseFloat(textArray[3]);
    
        //Get the value for interest rate
        const interestValue = selectedCircle && selectedCircle.InterestRate ? selectedCircle.InterestRate : 'Unknown Group'; // Use a default value if GroupName is not present
    
        // Calculate simple interest
        const interestRate = interestValue; // Example interest rate of 5% (replace with actual interest rate)
        const timePeriodInMonths = 1 * 1; // Example time period of 1 year (replace with actual time period)
        const simpleInterest = (depositAmount * interestRate * timePeriodInMonths) / 100;
        const simpleInterestFormatted = simpleInterest.toFixed(2); // Display with 2 decimal places
    
        const userWallet = await Wallet.findOne({ user: user._id });
        // Update the user's wallet and circle balance with the deposit amount and simple interest
        userWallet.balance -= depositAmount;
    
        // Create a new transaction object
        const transaction = new Transaction({
          sender: user._id,
          receiver: selectedCircle._id,
          amount: depositAmount,
        });
    
        // Add the transaction to the user's transaction array
        userWallet.transactions.push(transaction);
    
        // Find the existing member object in circleBalance and update the balance
        const num = user.number;
        const memberIndex = selectedCircle.MemberContribution.findIndex((member) => member.MemberPhoneNumber === num);
        if (memberIndex === -1) {
          // Add new member to the circle
          selectedCircle.MemberContribution.push({
            MemberPhoneNumber: phoneNumber,
            Contributed: depositAmount,
            Earnings: simpleInterestFormatted,
            FirstName: user.FirstName,
          });
        } else {
          // Update the existing member balance if it is not 0
          selectedCircle.MemberContribution[memberIndex].Contributed += depositAmount;
          selectedCircle.MemberContribution[memberIndex].Earnings += parseFloat(simpleInterestFormatted);

            
           // Check if the depositAmount equals the DepositGoal
          if (depositAmount === selectedCircle.DepositGoal) {
            const userm =await User.findOne({number: phoneNumber})
            const numStat = userm.number;
            // Find the corresponding member in the MemberStats array
            const memberStatsIndex = selectedCircle.MemberStats.findIndex(
              (member) => member.MemberPhoneNumber === numStat
            );

            console.log('MemberStatNumber:',memberStatsIndex.MemberPhoneNumber);
            if (memberStatsIndex !== -1) {
              // Update the GoalsMet field by incrementing it by 1
              selectedCircle.MemberStats[memberStatsIndex].GoalsMet += 1;
              await selectedCircle.save();
            }
          }
        }
    
        const selectedCircleIdString = selectedCircle._id.toString();
        const memberIndex2 = selectedCircle.circleBalance.findIndex((member) => member._id === selectedCircleIdString);
        if (memberIndex2 === -1) {
          // Add new member to the circle
          selectedCircle.circleBalance.push({
            _id: selectedCircleIdString,
            Balance: depositAmount,
          });
        } else {
          // Update the existing member balance if it is not 0
          selectedCircle.circleBalance[memberIndex2].Balance += depositAmount;
        }
    
        // Save the updated wallet, circle balance, and selectedCircle
        await userWallet.save();
        await selectedCircle.save();
    
        // Display success message to the user
        response = `END 
          Your Deposit of K<b>${depositAmount}</b> was successful to <b>${selectedCircle.GroupName}</b>.
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
    
    
    
  
    if (level === 3 && textArray[2] === '2') {
      // Check if user has a LoanBalance
      const user = await User.findOne({ number: phoneNumber });
      const nums = user.number;
 
      loan = await Savings.findOne({'LoanBalance.BorrowerNumber': nums});
      balance = loan ? loan.LoanBalance.find(balance => balance.BorrowerNumber === nums).LoanAmount : 0;
      interest = loan ? loan.LoanBalance.find(balance => balance.BorrowerNumber === nums).LoanInterest : 0;
      
      const totals = balance + interest;

      if (balance) {
        response = `END You still owe k${totals}.Repay the loan to continue.`;
        return response;
      }
      
    
      // Proceed with loan request
      response = `CON Why do you need a loan?
      Write a description..
      `;
      return response;
    }
     
  if (level === 4 && textArray[2] === '2' ) {
    response = `CON Enter the amount you want to borrow
              `;
    return response;
  
}  if(level === 5 && textArray[2] === '2' && textArray[3] && textArray[4]){
  response = `CON For many months do you want to borrow the money?`;
  return response;
}
if (level === 6 && textArray[2] === '2' && textArray[3] && textArray[5]) {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber },
      { 'LoanRequest.BorrowerNumber': phoneNumber }
    ]
  });
  const selectedCircle = userCircles[selectedCircleIndex];

  const loanReason = textArray[3];
  const loanAmount = parseFloat(textArray[4]);
  const proposedMonths = parseInt(textArray[5]);
  // Check if the loan amount is valid
  if (isNaN(loanAmount) || loanAmount <= 0) {
    response = `CON 
      Invalid loan amount. Please enter a valid amount:
      $`;
    return response;
  }

  // Check if the user has enough savings in the circle to request the loan
  const totalBalance = selectedCircle.circleBalance?.reduce(
    (sum, member) => sum + member.Balance,
    0
  ) ?? 0;

  if (loanAmount > totalBalance) {
    response = `CON 
      Insufficient savings in the circle to request a loan. Your available savings is $<b>${totalBalance}</b>.
      Please enter a valid loan amount:
      $`;
    return response;
  }

  const user = await User.findOne({ number: phoneNumber });
  const names = user.FirstName;

  // Add the loan request to the circle's LoanRequests array
  const loanRequest = {
    BorrowerNumber: phoneNumber,
    Name: names,
    LoanReason: loanReason,
    LoanAmount: loanAmount,
    ProposedMonths: proposedMonths,
    ApprovalVotes: [],
    RejectionVotes: [],
    Approved: false,
    Rejected: false
  };

  if (selectedCircle) {
    // Check if selectedCircle is defined and not null
    if (!selectedCircle.LoanRequest) {
      selectedCircle.LoanRequest = []; // Initialize LoanRequest as an empty array if it doesn't exist
    }
    selectedCircle.LoanRequest.push(loanRequest);

    //Get user data
    // Find the existing MemberStats for the member within the selectedCircle
    const existingMemberStatsIndex = selectedCircle.MemberStats.findIndex(memberStats => memberStats.MemberPhoneNumber === user.number);

    // If no existing MemberStats found, create and push a new one
    if (existingMemberStatsIndex === -1) {
      const newMemberStats = {
        Date: new Date(),
        MemberPhoneNumber: user.number,
        Name: user.FirstName,
      };

      selectedCircle.MemberStats.push(newMemberStats);
    } 

    await selectedCircle.save();
  } else {
    console.error('selectedCircle is undefined or null'); // Handle the case where selectedCircle is undefined or null
  }
  response = `END 
    Your loan request has been submitted for approval. You will receive a notification when it has been approved or rejected.
  `;
  return response;
}



if (level === 3 && textArray[2] == 'a') {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
  });
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

      const loanAmount = loanRequest ? loanRequest.LoanAmount : 0;
      const borrowerIndex = selectedCircle.LoanRequest.findIndex(
        (member) => member.BorrowerNumber === loanRequest.BorrowerNumber
      );

      if (borrowerIndex === -1) {
        response = `END Error: borrower not found in circle balance.`;
        return response;
      }

      if (selectedCircle.circleBalance[borrowerIndex].Balance < loanAmount) {
        response = `END Error: borrower does not have sufficient balance to request for a loan.`;
        return response;
      }

      selectedCircle.circleBalance[borrowerIndex].Balance -= loanAmount;

      // After the loan request is approved, add the loan amount to the borrower's wallet
      const userwallet = await User.findOne({ number: loanRequest.BorrowerNumber });
      const wallet = await Wallet.findOne({ user: userwallet._id });

      if (!wallet) {
        response = `END Error: borrower wallet not found`;
        return response;
      }

      wallet.balance += loanAmount;
      await wallet.save();

      const disbursedDate = new Date();
      loanRequest.disbursedDate = disbursedDate;

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1); // Set the due date to one month from the disbursed date
      loanRequest.dueDate = dueDate;

      const currentDate = new Date();
      const timeDifference = dueDate.getTime() - currentDate.getTime();
      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      await selectedCircle.save();

      const interestValue = selectedCircle && selectedCircle.InterestRate ? selectedCircle.InterestRate : 'Unknown Group';

      const interestRate = interestValue;
      const timePeriodInMonths = 1;
      const simpleInterest = (loanAmount * interestRate * timePeriodInMonths) / 100;
      const simpleInterestFormatted = simpleInterest.toFixed(2);

      const totalLoan = parseFloat(loanAmount) + parseFloat(simpleInterestFormatted);

      const users = await User.findOne({ number: loanRequest.BorrowerNumber });
      const loanBalance = {
        BorrowerNumber: loanRequest.BorrowerNumber,
        LoanAmount: loanAmount,
        LoanInterest: simpleInterestFormatted,
        totalLoan: totalLoan,
        Name: users.FirstName,
        Status: loanRequest.Status = 'Approved',
        disbursedDate: disbursedDate,
        dueDate: dueDate,
        daysRemaining: daysRemaining
      };

      selectedCircle.LoanBalance.push(loanBalance);

      const loanIndex = selectedCircle.LoanRequest.findIndex((id) => id._id === loanRequest._id);
      selectedCircle.LoanRequest.splice(loanIndex, 1);
      
      // Check if MemberStats exists for the borrower
      const borrowerStats = selectedCircle.MemberStats.find(
        (member) => member.MemberPhoneNumber === loanRequest.BorrowerNumber
      );

      if (borrowerStats) {
        // Update the amount and date fields
        borrowerStats.Amount += loanAmount;
        borrowerStats.Date = disbursedDate.toISOString();
      }
      
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
  const userCircles = await Savings.find({ 
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
   });
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

if (level === 3 && textArray[2] === '3') {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
  });
  
  const selected = userCircles[selectedCircleIndex];

  if (!selected || !selected.MemberContribution || selected.MemberContribution.length === 0) {
    // If no selected circle or no contributions, display "No contribution"
    const response = "CON No contribution";
    return response;
  }

  let response = "CON <b>Member Contributions:</b>";
  for (let i = 0; i < selected.MemberContribution.length; i++) {
    const contribution = selected.MemberContribution[i];
    const username = contribution.FirstName;
    const contributes = contribution.Contributed || 0;

    response += `
    Name: <b>${username}</b>
    Total Contributed: <b>K${contributes}</b>
    `;
  }

  return response;
}

if (level === 3 && textArray[2] === '4') {
  

  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({ 
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
   });
  const selected = userCircles[selectedCircleIndex];

  if (selected.LoanBalance.length === 0) {
    // If LoanBalance array has no data, display "No loan balances"
   const response = `CON No loan balances`;
    return response;
  }

  let response = "CON <b>Current Loans</b>:\n";
  for (let i = 0; i < selected.LoanBalance.length; i++) {
    const member = selected.LoanBalance[i];
    const totalLoans = member.totalLoan;
    const interest = member.LoanInterest;
    const borrowed = member.LoanAmount;
    const due = member.dueDate.toDateString();
    response += `                   
        <b>${member.Name}</b>:                     
            Balance: <b>K${totalLoans}</b> left
            Due: <b>${due}</b>                        
            Amount: <b>K${borrowed}</b> at <b>${interest}%</b>
         
    `;
  }
  
  return response;
  
} 

if (level === 3 && textArray[2] === '5') {
  async function confirmDetails() {
    let user = await Savings.findOne({
      $or: [
        { AdminNumber1: phoneNumber },
        { AdminNumber2: phoneNumber },
        { Creator: phoneNumber },
      ],
    });
    return user;
  }

  // Assigns the user to a variable for manipulation
  let Admin = await confirmDetails();

  if (Admin) {
    response = `CON 
      1.Invite Members
      2.Delete User
      3.Delete Circle
    `;
    return response;
  } else if(!Admin) {
    response = `END Only Admins can access this area!`;
    return response;
  }

}if(level === 4 && textArray[3] === '1'){
  response = `CON Enter the number you want to invite to the circle`;
  return response;
} else if (level == 5 ) {
    let circleMember = textArray[4];
    console.log(circleMember)
  let user = await Savings.findOne({
    $or: [
      { AdminNumber1: phoneNumber },
      { AdminNumber2: phoneNumber },
      { Creator: phoneNumber },
    ],
  });
  let code = user.GroupCode;
  let name = user.GroupName;

  await Savings.findOneAndUpdate(
    { GroupCode: code },
    { $push: { InvitedMembers: { InvitedNumber: +26+textArray[4] } } },
    { new: true, upsert: true }
  ); 
  response = `CON ${circleMember}, has been invited to join <b>${name}</b> and added to the invite list`;
  return response;
}if(level === 4 && textArray[3]  === '2' ){
  response = `CON Enter a member phone number to delete`;
  return response;
}else if(level === 5){
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
  });
  const selectedCircle = userCircles[selectedCircleIndex];

  const memberToRemove = textArray[4];
  const updatedGroupMembers = selectedCircle.GroupMembers.filter(
    (member) => member.MemberPhoneNumber != memberToRemove
  );

  await selectedCircle.updateOne({ GroupMembers: updatedGroupMembers });
  response = `END ${memberToRemove} has been removed from the circle.`;
  return response;
}
  
if(level === 3 && textArray[2] === "0"){
  response = await  handleMember(textArray.slice(0, 1), phoneNumber);
  return response;
}

if (level === 3 && textArray[2] === "6") {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
  });
  const selectedCircle = userCircles[selectedCircleIndex];
  const selected = userCircles[selectedCircleIndex];

  // Check if the user is in debt
  const userd = await User.findOne({ number: phoneNumber });
  const borrowerNumb = userd.number;
  const userDebt = selectedCircle.LoanBalance.findIndex((member) => member.BorrowerNumber === borrowerNumb);

  // Update the loan balance for the user
  const loanBalance = selectedCircle.LoanBalance[userDebt];
  const remainingLoanAmount = loanBalance.totalLoan;

  response = `CON Enter the amount you want to pay towards your loan balance:\nLoan Balance: K${remainingLoanAmount}\n`;
  return response;
} else {
  const selectedCircleIndex = parseInt(textArray[1]) - 1;
  const userCircles = await Savings.find({
    $or: [
      { 'GroupMembers.MemberPhoneNumber': phoneNumber },
      { 'GroupMembers.Creator': phoneNumber },
      { 'GroupMembers.AdminNumber1': phoneNumber },
      { 'GroupMembers.AdminNumber2': phoneNumber }
    ]
  });

  const repaymentAmount = parseFloat(textArray[3]);

  const selectedCircle = userCircles[selectedCircleIndex];
  const selected = userCircles[selectedCircleIndex];

  // Check if the user is in debt
  const userd = await User.findOne({ number: phoneNumber });
  const borrowerNumb = userd.number;
  const borrowerName = userd.FirstName;
  const userDebt = selectedCircle.LoanBalance.findIndex((member) => member.BorrowerNumber === borrowerNumb);
  const loanBalance = selectedCircle.LoanBalance[userDebt];
  // Check if user has enough balance in the wallet to repay the loan
  const wallet = await Wallet.findOne({ user: userd._id });

  if (isNaN(repaymentAmount) || repaymentAmount <= 0) {
    response = `END Invalid amount. Please enter a valid amount to pay towards your loan balance.`;
  } else if (wallet.balance >= repaymentAmount) {
    // Update the wallet balance
    const repaymentAmountLimited = Math.min(repaymentAmount, loanBalance.totalLoan);
    wallet.balance -= repaymentAmountLimited;
    await wallet.save();

    // Update the circle balance
    const selectedCircleIdString = selectedCircle._id.toString();
    const memberIndex2 = selectedCircle.circleBalance.findIndex((member) => member._id === selectedCircleIdString);

    selected.circleBalance[memberIndex2].Balance += repaymentAmount;

    // Deduct the repayment amount from the loan balance
    loanBalance.totalLoan -= repaymentAmountLimited;

    // Check if the loan is fully repaid
    if (loanBalance.totalLoan === 0) {
      // Remove the loan balance entry
      selectedCircle.LoanBalance.splice(userDebt, 1);

      // Update circleBalance with LoanInterest
      selected.circleBalance[memberIndex2].LoanInterest += loanBalance.LoanInterest;

      // Check if the loan is past dueDate
      const currentDate = new Date();
      const dueDate = loanBalance.dueDate;

      if (currentDate > dueDate) {
        // Update LatePayments in MemberStats by 1
        const borrowerStats = selectedCircle.MemberStats.find((member) => member.MemberPhoneNumber === borrowerNumb);

        if (borrowerStats) {
          borrowerStats.LatePayments += 1;
        }
      }

      // Update the PaidLoans field in MemberStats
      const borrowerStats = selectedCircle.MemberStats.find((member) => member.MemberPhoneNumber === borrowerNumb);

      if (borrowerStats) {
        borrowerStats.PaidLoans += 1;
      } else {
        selectedCircle.MemberStats.push({
          Date: new Date(),
          Amount: loanBalance.loanAmount,
          MemberPhoneNumber: borrowerNumb,
          Name: borrowerName,
          PaidLoans: 1
        });
      }
      
      await selected.save();
    }

    await selected.save();
    await selectedCircle.save();

    response = `END Repayment of K${repaymentAmountLimited} successful.`;

    // Check if the loan is fully repaid
    if (loanBalance.totalLoan === 0) {
      response += ` Your loan balance has been cleared.`;
    } else {
      const totalRemaining = loanBalance.totalLoan;
      response += ` Your remaining loan balance is K${totalRemaining}.`;
    }
  } else {
    response = `END Insufficient balance. Your wallet balance is not enough to repay the loan.`;
  }
   
  return response;
}
};



module.exports = handleMember;
