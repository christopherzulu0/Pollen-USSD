const { Transaction, Wallet, User, Savings, PersonalSavings } = require('./models/Schemas');
const axios = require('axios');
const countryCode = require('./util/countryCode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { v4: uuidv4 } = require('uuid');

const Send_Money = {
  SendMoney: async (textArray, phoneNumber) => {

           //PawaPay MTN Deposits
           async function mtnPayouts(amount) {
            const pawaPayEndpointPayouts = process.env.pawaPayEndpointPayouts; // PawaPay API endpoint
            const apiKey = process.env.PawaPayKey; // Replace with your PawaPay API key
            const receiver = countryCode(textArray[2]);
            const user = await User.findOne({ number: receiver });
            const receiverContact = user.number;
            const reason  = textArray[4];
            console.log("Reason:",reason);

            const payload = {
             payoutId: uuidv4(),
              amount: amount.toString(),
              currency: "ZMW",
              country: "ZMB",
              correspondent: "MTN_MOMO_ZMB",
              recipient: {
                type: "MSISDN",
                address: {
                  value: receiverContact,
                },
              },
              customerTimestamp: new Date().toISOString(),
              statementDescription: reason,
              created: new Date().toISOString(),
              receivedByRecipient: new Date().toISOString(),
              correspondentIds: {
                MTN_INIT: "764724",
                MTN_FINAL: "hsdhs21",
              },
              failureReason: {
                failureCode: "OTHER_ERROR",
                failureMessage: "Recipient's address is blocked",
              },
            };
          
            try {
              const response = await axios.post(pawaPayEndpointPayouts, payload, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
              });
          
              console.log("Response status code:", response.status);
              console.log("Response data:", response.data);
              return response.data;
            } catch (error) {
              console.error("Payment request error:", error.response);
              throw new Error("Payment request failed");
            }
          }
          
          //AirtelPayouts
          async function airtelPayouts(amount) {
            const pawaPayEndpointPayouts = process.env.pawaPayEndpointPayouts; // PawaPay API endpoint
            const apiKey = process.env.PawaPayKey; // Replace with your PawaPay API key
            const receiver = countryCode(textArray[2]);
            const user = await User.findOne({ number: receiver });
            const receiverContact = user.number;
            const reason  = textArray[4];
            console.log("Reason:",reason);

            const payload = {
             payoutId: uuidv4(),
              amount: amount.toString(),
              currency: "ZMW",
              country: "ZMB",
              correspondent: "AIRTEL_OAPI_ZMB",
              recipient: {
                type: "MSISDN",
                address: {
                  value: receiverContact
                }
              },
              customerTimestamp: new Date().toISOString(),
              statementDescription: reason,
              created: new Date().toISOString(),
              receivedByRecipient: new Date().toISOString(),
              correspondentIds: {
                AIRTEL_INIT: "764724",
                AIRTEL_FINAL: "hsdhs21"
              },
              failureReason: {
                failureCode: "OTHER_ERROR",
                failureMessage: "Recipient's address is blocked"
              }
            };
          
            try {
              const response = await axios.post(pawaPayEndpointPayouts, payload, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
              });
          
              console.log("Response status code:", response.status);
              console.log("Response data:", response.data);
              return response.data;
            } catch (error) {
              console.error("Payment request error:", error.response);
              throw new Error("Payment request failed");
            }
          }
          
          

    const level = textArray.length;
    let response = "";

    if (level === 1) {
      response = `CON 
                   Seleect the network provider for the receiver
                 1. Airtel
                 2. MTN
                 `;
      return response;
    } 
    
    //PawaPay Airtel Payout
    if (level === 2 && textArray[1] === '1') {
      response = `CON Enter Airtel number of the receiver:`;
      return response;
    }else if (level === 3 && textArray[1] === '1') {
      response = `CON Enter amount:`;
      return response;
    } else if (level === 4 && textArray[1] === '1') {
      response = `CON Reason for sending the money`;
      return response;
    }else if (level === 5 && textArray[1] === '1') {
      response = `CON Enter your PIN:`;
      return response;
    } else if (level === 6 && textArray[1] === '1') {
      const receiverNumber = countryCode(textArray[2]);
      const receivers = await User.findOne({ number: receiverNumber });

      if (!receivers) {
        return (response = "CON The receiver is not registered on Pollen.\n99. Go Back");
      } else {
        const receiverNumber = countryCode(textArray[2]);
        const receiver = await User.findOne({ number: receiverNumber });
        const receiverWallets = await Wallet.findOne({ user: receiver._id });
        const user = await User.findOne({ number: phoneNumber });
        const sender = await Wallet.findOne({ user: user._id });

        let senderName = user.FirstName;
        let receiverName = receiver.FirstName;
        let amount = parseInt(textArray[3]);
        let reason = textArray[4]
        const senderWallet = sender.balance;
        let senderPin = user.pin;

        // Validate the PIN
        if (textArray[5] !== senderPin) {
          return (response = "CON Invalid PIN. Transaction cancelled.\n99. Go Back");
        }

        // Check if sender has enough funds
        if (amount > senderWallet) {
          return (response = "CON Insufficient funds. Transaction cancelled.\n99. Go Back");
        }

        // Make payment request to PawaPay
        try {
          const paymentResponse = await airtelPayouts(amount, receiverNumber);
          // Process the payment response from PawaPay
          if (paymentResponse.status === 'ACCEPTED') {
            // Deduct from sender's balance and add to receiver's balance
            sender.balance -= amount;
            receiverWallets.balance += amount;
            await sender.save();
            await receiverWallets.save();

            // Create transaction records
            let senderTransaction = new Transaction({
              type: "debit",
              amount: amount,
              reason: reason,
              balance: sender.balance,
              user: sender._id,
              description: `Sent K${amount} to ${senderName}`,
            });
            let receiverTransaction = new Transaction({
              type: "credit",
              amount: amount,
              reason: reason,
              balance: receiverWallets.balance,
              user: receiver._id,
              description: `Received K${amount} from ${receiverName}`,
            });
            await senderTransaction.save();
            await receiverTransaction.save();

            response = `CON Your payment of K${amount} to ${receiverName} has been submitted.
              You will receive an SMS notification once it is complete.
              99. Go Back`;
          } else {
            // Payment request failed, handle the error
            response = `CON Payment request failed: ${paymentResponse.error}`;
          }
        } catch (error) {
          // An error occurred during the payment request
          console.log("Payment request error:", error);
          response = "CON An error occurred while processing the payment. Please try again later.\n99. Go Back";
        }
      }

      return response;
    } else if (level === 5 && textArray[4] == 2) {
      return (response = "CON Cancelled. Thank you for using our service.\n99. Go Back");
    }
    
       //PawaPay MTN Payout
    if (level === 2 && textArray[1] === '2') {
      response = `CON Enter MTN number of the receiver:`;
      return response;
    }else if (level === 3 && textArray[1] === '2') {
      response = `CON Enter amount:`;
      return response;
    } else if (level === 4 && textArray[1] === '2') {
      response = `CON Reason for sending the money`;
      return response;
    }else if (level === 5 && textArray[1] === '2') {
      response = `CON Enter your PIN:`;
      return response;
    } else if (level === 6 && textArray[1] === '2') {
      const receiverNumber = countryCode(textArray[2]);
      const receivers = await User.findOne({ number: receiverNumber });

      if (!receivers) {
        return (response = "CON The receiver is not registered on Pollen.\n99. Go Back");
      } else {
        const receiverNumber = countryCode(textArray[2]);
        const receiver = await User.findOne({ number: receiverNumber });
        const receiverWallets = await Wallet.findOne({ user: receiver._id });
        const user = await User.findOne({ number: phoneNumber });
        const sender = await Wallet.findOne({ user: user._id });

        let senderName = user.FirstName;
        let receiverName = receiver.FirstName;
        let amount = parseInt(textArray[3]);
          let reason = textArray[4]
        const senderWallet = sender.balance;
        console.log("Total:",senderWallet)
        let senderPin = user.pin;

        // Validate the PIN
        if (textArray[5] !== senderPin) {
          return (response = "CON Invalid PIN. Transaction cancelled.\n99. Go Back");
        }

        // Check if sender has enough funds
        if (amount > senderWallet) {
          return (response = "CON Insufficient funds. Transaction cancelled.\n99. Go Back");
        }

        // Make payment request to PawaPay
 
        try {

          const paymentResponse = await mtnPayouts(amount,textArray);
          // Process the payment response from PawaPay
          if (paymentResponse.status === 'ACCEPTED') {
            // Deduct from sender's balance and add to receiver's balance
            sender.balance -= amount;
            receiverWallets.balance += amount;
            await sender.save();
            await receiverWallets.save();

            // Create transaction records
            let senderTransaction = new Transaction({
              type: "debit",
              amount: amount,
               reason: reason,
              balance: sender.balance,
              user: sender._id,
              description: `Sent K${amount} to ${senderName}`,
            });
            let receiverTransaction = new Transaction({
              type: "credit",
              amount: amount,
              reason: reason,
              balance: receiverWallets.balance,
              user: receiver._id,
              description: `Received K${amount} from ${receiverName}`,
            });
            await senderTransaction.save();
            await receiverTransaction.save();

            response = `CON Your payment of K${amount} to ${receiverName} has been submitted.
              You will receive an SMS notification once it is complete.
              99. Go Back`;
          } else {
            // Payment request failed, handle the error
            console.log("Payment response:", paymentResponse);
            response = `CON Payment request failed: ${paymentResponse.error}\n99. Go Back`;
            return response;
          }
        } catch (error) {
          // An error occurred during the payment request
          console.error("Payment request error:", error);
          throw new Error(`Payment request failed: ${error.message}`);
        }
        
      }

      return response;
    } else if (level === 5 && textArray[4] == 2) {
      return (response = "CON Cancelled. Thank you for using our service.\n99. Go Back");
    } 
  
    else {
      return (response = "CON Invalid entry.\n99. Go Back");
    }
  },
};





module.exports = Send_Money;
