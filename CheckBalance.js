const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');

const CheckBalance = {
    CheckBalance: async (textArray,phoneNumber) => {
        let response = "";
        const level = textArray.length;
    
        const user = await User.findOne({ number: phoneNumber });
        const bal = await Wallet.findOne({ user: user._id });
        const mybalance = bal ?  bal.balance : 0;
    
      
        const savingsbalance = await PersonalSavings.findOne({ user: user._id });
        const savings = savingsbalance ? savingsbalance.balance:0;
        
        
        if(level === 1){
          response = `CON View your account balances
          
          Wallet balance: K${mybalance}
          Savings balance:K ${savings}
          `;
    
          const userCircles = await Savings.find({ 
            $or: [
              { 'GroupMembers.MemberPhoneNumber': phoneNumber },
              { 'GroupMembers.Creator': phoneNumber },
              { 'GroupMembers.AdminNumber1': phoneNumber },
              { 'GroupMembers.AdminNumber2': phoneNumber }
            ]
           });
    
        response += `
        Select a circle to view balance :\n`;
        userCircles.forEach((circle, index) => {
          response += `${index + 1}. ${circle.GroupName}\n`;
        });
       
          return response;
        }if (level === 2) {
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
    
          if (!selectedCircle) {
            response = `END Invalid circle input. Please select a valid circle number.`;
            return response;
          }
        
           //Get the balance for the selectedCircle
          const circleBalance =selectedCircle ? selectedCircle.circleBalance[0].Balance : 0;
          const circleInterest = selectedCircle ? selectedCircle.circleBalance[0].LoanInterest:0;
         
    
        //Get member contribution data
        const userd = await User.findOne({ number: phoneNumber });
        const ContributedNumber = userd.number;
        const contributedCircle = selectedCircle.MemberContribution.findIndex((member) => member.MemberPhoneNumber === ContributedNumber);
        const availableContribution = selectedCircle.MemberContribution[contributedCircle];
        const MemberContributes = availableContribution ? availableContribution.Contributed:0;
    
        
        //Get Loan Balance Date for the user
        const Loans = selectedCircle.LoanBalance.findIndex((member) => member.BorrowerNumber === ContributedNumber);
        const outstandingLoans = selectedCircle.LoanBalance[Loans];
        const MemberLoan = outstandingLoans ? outstandingLoans.totalLoan:0;
        console.log("MemberLoan:", MemberLoan);
    
        //Get total interest for all outstanding loans
        const totalLoanInterest = selectedCircle.LoanBalance.reduce((sum, member) => {
          if (member.Status === 'Approved') {
            return sum + member.LoanInterest;
          }
          return sum;
        }, 0);
        
        
        //Calculate user expected interest
        const expected = (circleInterest + totalLoanInterest)%(MemberContributes-MemberLoan)%(circleBalance-circleInterest);
       
          response = `CON 
                     Hi,<b>${userd.FirstName}!\n</b>
                     <b>Group Details</b>
                      Balance: <b>K${circleBalance}</b>
                      Interest:  <b>K${circleInterest}</b>
                      Penalties = K0
                       
                     <b>Personal Information</b>
                      Contribution:<b>K${MemberContributes}</b>
                      Earned Interest = <b>K${expected}</b>
                      
                      99. Go Back
                      `;
          return response;
        }
       
      }

  
  
};

module.exports = CheckBalance;