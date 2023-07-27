const { Transaction, Wallet, User, Savings, PersonalSavings } = require('./models/Schemas');
const axios = require('axios');
const https = require('https');
const Notifications = {
  Notification: async (textArray, phoneNumber, userName, total, das, loans, totalRequests) => {

    async function getPaymentDetails(depositId) {
      const pawaPayEndpoint = `https://api.sandbox.pawapay.cloud/${depositId}`;
      const apiKey = process.env.PawaPayKey;
    
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      };
    
      return new Promise((resolve, reject) => {
        const req = https.request(pawaPayEndpoint, requestOptions, (res) => {
          let data = '';
    
          res.on('data', (chunk) => {
            data += chunk;
          });
    
          res.on('end', () => {
            console.log('Raw response data:', data); // Debug statement
    
            try {
              const response = JSON.parse(data);
    
              console.log('Parsed response:', response); // Debug statement
    
              if (response && response.details && Array.isArray(response.details)) {
                // Return all payment details for the specified deposit ID
                resolve(response.details);
              } else {
                reject(new Error("Invalid payment details response"));
              }
            } catch (error) {
              reject(error);
            }
          });
        });
    
        req.on('error', (error) => {
          reject(error);
        });
    
        req.end();
      });
    }
    
    
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
      response += `99. Go Back`;
    } 
    
    // else if (level === 2 && textArray[1] === '77') {
    //   response = `CON Enter the deposit ID:`;
    // } else if (level === 3 && textArray[1] === '77') {
    //   const depositId = textArray[2];

    //   try {
    //     const paymentDetails = await getPaymentDetails(depositId, null);

    //     if (paymentDetails.length > 0) {
    //       response = `CON Payment Details for Deposit ID: ${depositId}\n`;
    //       paymentDetails.forEach((detail, index) => {
    //         response += `Payment ${index + 1}:\n`;
    //         response += `Payer Number: ${detail.payer && detail.payer.address ? detail.payer.address.value : 'N/A'}\n`;
    //         response += `Status: ${detail.status}\n`;
    //         response += `Created: ${detail.created}\n\n`;
    //       });
    //     } else {
    //       response = `CON No payment details found for Deposit ID: ${depositId}`;
    //     }
    //   } catch (error) {
    //     console.error("Payment details request error:", error);
    //     response = "CON Failed to retrieve payment details. Please try again later.";
    //   }
    // }

    return response;
  }
};

module.exports = Notifications;
