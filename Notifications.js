const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');

const Notifications = {
  Notification: async (textArray, phoneNumber,userName, total, das, loans, totalRequests) => {
    let response = "";
    const level = textArray.length;
    
    const userCircles = await Savings.find({
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
    });
  
    
    if (level === 1) {
      response = `CON <b>Notifications Menu</b>\n`;
  
      if (userCircles && userCircles.length > 0) {
        userCircles.forEach((circle, index) => {
          response += `${index + 1}. <b>${circle.GroupName}</b>\n`;
  
          const loanRequests = circle.LoanRequest;
          if (loanRequests && loanRequests.length > 0) {
            response += `Pending Loan Votes(<b>${loanRequests.length}</b>):\n`;
  
            loanRequests.forEach((request, i) => {
              response += `${i + 1}. ${request.Name} (<b>K${request.LoanAmount}</b> for ${request.LoanReason})\n`;
            });
          } else {
            response += `No pending loan votes\n`;
          }
  
          response += '\n';
        });
      } else {
        response += `No user circles found\n`;
      }
       // Add a button to go to the userRegistered menu
    response += `99. Go Back\n`;
  }if (level === 2 && textArray[1] === '99') {
  }
  
  
  

  return response;
    
  }

  
  
};

module.exports = Notifications;