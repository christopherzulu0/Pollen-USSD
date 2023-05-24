const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const { response } = require("express");
const qs = require("qs");
const axios = require("axios");
const shortid = require('shortid');

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


// Function for handling non-registered users
const HandleSavings = async (textArray, phoneNumber) => {
 
    const level = textArray.length;
    let response = "";
    
    const user = await User.findOne({ number: phoneNumber });
    const bal = await Wallet.findOne({ user: user._id });
    const mybalance = bal ? bal.balance : 0;
  
    const savingsbalance = await PersonalSavings.findOne({ user: user._id });
    const savings = savingsbalance ? savingsbalance.balance:0;
  
    switch (level) {
      case 1:
        response = `CON Earn interest on your digital Dollars via Defi, current interest rate:
                    [APY]% 
                    Your wallet balance: K${mybalance}
                    Your savings balance: K${savings}
  
                    1. Deposit to savings
                    2. Withdraw from savings
                    `;
        break;
      case 2:
        if (textArray[1] == 1) {
          response = `CON Enter an amount to deposit to savings.
                      Available wallet balance:
                      K${mybalance}
          `;
        } else if (textArray[1] == 2) {
          response = `CON Enter an amount to withdraw from savings.
                       Available savings balance: K${savingsbalance.balance}
                       `;
        }
        break;
      case 3:
        let amount = textArray[2];
  
        if (textArray[1] == 1) {
          if (amount > bal.balance) {
            response = `END You have insufficient balance`;
            return response;
          } else {
            response = `CON Enter your pin to deposit K${amount} into savings.
                        `;
          }
        } else if (textArray[1] == 2) {
          if (amount > savingsbalance.balance) {
            response = `END You have insufficient savings balance`;
            return response;
          } else {
            response = `CON Enter your pin to withdraw K${amount} from savings.
                        `;
          }
        }
        break;
      case 4:
        const pin = textArray[3];
        const user = await User.findOne({ number: phoneNumber });
  
        if (pin != user.pin) {
          response = `END Incorrect PIN. Please try again.`;
          return response;
        } else {
          let amount = textArray[2];
          if (textArray[1] == 1) {
            // Deduct amount from wallet balance
            bal.balance -= amount;
            // Add amount to savings balance
            savingsbalance.balance = Number(savingsbalance.balance) + Number(amount);
            await savingsbalance.save();
            await bal.save();
            response = `END Successfully deposited K${amount} to your savings account. Your new savings balance is K${savingsbalance.balance}.`;
          } else if (textArray[1] == 2) {
            // Deduct amount from savings balance
            savingsbalance.balance -= amount;
            // Add amount to wallet balance
            bal.balance = Number(bal.balance) + Number(amount);
            await savingsbalance.save();
            await bal.save();
            response = `END Successfully withdrew K${amount} from your savings account. Your new savings balance is K${savingsbalance.balance}.`;
          }
          return response;
        }
      default:
        break;
    }
  
    return response;
  

    
  };
  

module.exports = HandleSavings;
