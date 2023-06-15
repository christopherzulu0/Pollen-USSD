const { Transaction, Wallet, User, Savings, PersonalSavings } = require('./models/Schemas');
const axios = require('axios');
const countryCode = require('./util/countryCode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const Send_Money = {
  SendMoney: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";

    if (level === 1) {
      response = `CON Enter mobile number of the receiver:`;
      return response;
    } else if (level === 2) {
      response = `CON Enter amount:`;
      return response;
    } else if (level === 3) {
      response = `CON Enter your PIN:`;
      return response;
    } else if (level === 4) {
      const receiverNumber = countryCode(textArray[1]);
      const receivers = await User.findOne({ number: receiverNumber });

      if (!receivers) {
        return (response = "CON This user has not signed up for Pollen. Would you like to invite them to join?\n1. Yes\n2. No\n99. Go Back");
      } else {
        const receiverNumber = countryCode(textArray[1]);
        const receiver = await User.findOne({ number: receiverNumber });
        const receiverWallets = await Wallet.findOne({ user: receiver._id });
        const user = await User.findOne({ number: phoneNumber });
        const sender = await Wallet.findOne({ user: user._id });

        let senderName = user.FirstName;
        let receiverName = receiver.FirstName;
        let amount = parseInt(textArray[2]);
        const senderWallet = sender.balance;
        let senderPin = user.pin;

        // Validate the PIN
        if (textArray[3] !== senderPin) {
          return (response = "CON Invalid PIN. Transaction cancelled.\n99. Go Back");
        }

        // Check if sender has enough funds
        if (amount > senderWallet) {
          return (response = "CON Insufficient funds. Transaction cancelled.\n99. Go Back");
        }

        // Make payment request to PawaPay
        try {
          const paymentResponse = await makePawaPayPayment(amount, receiverNumber);
          // Process the payment response from PawaPay
          if (paymentResponse.success) {
            // Deduct from sender's balance and add to receiver's balance
            sender.balance -= amount;
            receiverWallets.balance += amount;
            await sender.save();
            await receiverWallets.save();

            // Create transaction records
            let senderTransaction = new Transaction({
              type: "debit",
              amount: amount,
              balance: sender.balance,
              user: sender._id,
              description: `Sent K${amount} to ${senderName}`,
            });
            let receiverTransaction = new Transaction({
              type: "credit",
              amount: amount,
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
            response = `CON Payment request failed: ${paymentResponse.error}\n99. Go Back`;
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
    } else {
      return (response = "CON Invalid entry.\n99. Go Back");
    }
  },
};

// Function to make a payment request to PawaPay
async function makePawaPayPayment(amount, phoneNumber) {
  const pawaPayEndpoint = "https://api.sandbox.pawapay.cloud/payouts"; // PawaPay API endpoint
  const apiKey = "YeyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJiMDlkZGUwMi1lYjgxLTQ0NzQtYWQ0Yi0wNGY4M2EwMDgxNDMiLCJzdWIiOiIxMjYiLCJpYXQiOjE2ODY3NDU4NjAsImV4cCI6MjAwMjM2NTA2MCwicG0iOiJEQUYsUEFGIiwidHQiOiJBQVQifQ.yJM3kKDMujwX6W9DMSvO4MULi3jTyZ7Q21hQRgzuykI"; // Replace with your PawaPay API key

  const payload = {
    payoutId: "f4401bd2-1568-4140-bf2d-eb77d2b2b639", // Replace with your payout ID
    amount: amount.toString(),
    currency: "ZMW",
    country: "ZMB",
    correspondent: "MTN_MOMO_ZMB",
    recipient: {
      type: "MSISDN",
      address: { value: phoneNumber },
    },
    customerTimestamp: new Date().toISOString(),
    statementDescription: "Up to 22 chars note",
  };

  const curlCommand = `curl -X POST ${pawaPayEndpoint} \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${apiKey}" \
    -d '${JSON.stringify(payload)}'`;

  console.log("Executing curl command:", curlCommand);

  return new Promise((resolve, reject) => {
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Payment request error:", error);
        reject(new Error("Payment request failed"));
      } else {
        console.log("Curl command output:", stdout);
        const data = JSON.parse(stdout);
        resolve(data);
      }
    });
  });
}

module.exports = Send_Money;
