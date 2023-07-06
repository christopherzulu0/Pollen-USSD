const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');
const axios = require("axios");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const qs = require("qs");

const HandleSavings = require('./HandleSavings')
const { response } = require('express');
const CircleSavings = require("./menu")
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

const sendSMS2 = async (phoneNumber, message) => {
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




const menu = {
  MainMenu:(userName,total,das,loans,totalRequests) => {
    
     if(loans){
      const requestsCount = totalRequests || 0;
      const response = `CON Welcome Back! <b>${userName}</b>
      Loan Balance: <b>K${total}</b>
      Loan due in: <b>${das} Days</b>
      Please choose an option:
      1. Village Banking
      2. Personal Savings
      3. View Balances
      4. Payments
      5. Deposit/Withdraw from Momo
      6. Notifications(<b>${requestsCount}</b>)
      7. Help

      `;
return response;
    }else{
      const requestsCount = totalRequests || 0;
      const response = `CON Welcome Back! <b>${userName}</b>
      Please choose an option:
      1. Village Banking
      2. Personal Savings
      3. View Balances
      4. Payments
      5. Deposit/Withdraw from Momo
      6. Notifications(<b>${requestsCount}</b>)
      7. Help

      `;
return response;

    }
    
    
  },
  unregisteredMenu: () => {
    const response = `CON Welcome to Pollen. The best Open Village Banking platform in Zambia.
            1. Register
            `;

    return response;
  },
  Register: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";
    
    switch (level) {
      case 1:
        response = "CON What is your first name";
        break;
      case 2:
        response = "CON What is your last name";
        break;
      case 3:
        response = "CON Enter your email address";
        break;
      case 4:
        response = "CON Enter your date of birth \n E.g 26/02/2000";
        break;
      case 5:
        response = "CON Enter your NRC number \n E.g 412787/53/1";
        break;
      case 6:
        response = "CON Set a login pin(4 Digits)";
        break;
      case 7:
        response = "CON Please confirm your PIN:";
        break;
      case 8:
        response = `CON Confirm Your Details:
                    First Name: ${textArray[1]}
                    Last Name: ${textArray[2]}
                    Email: ${textArray[3]}
                    D.O.B: ${textArray[4]}
                    NRC Number: ${textArray[5]}
                    Pin: ${textArray[6]}

                    1.Confirm & continue
                   `;
        break;
      case 9:
        if(textArray[8] == 1){
        const pin = textArray[6];
        const confirmPin = textArray[7];
        // Check if the name is strictly alphabets via regex
        if (/[^a-zA-Z]/.test(textArray[1])) {
          response = "END Your full name must not consist of any number or symbol. Please try again";
        }
        // Check if the pin is 5 characters long and is purely numerical
        else if (pin.toString().length != 4 || isNaN(pin)) {
          response = "END Your must be 4 digits.Please try again!";
        }
        // Check if the pin and confirmed pin is the same
        else if (pin != confirmPin) {
          response = "END Your pin does not match. Please try again";
        } else {
          // proceed to register user
          async function createUser() {
            const userData = {
              FirstName: textArray[1],
              LastName: textArray[2],
              Email: textArray[3],
              DOB: textArray[4],
              NationalID: textArray[5],
              number: phoneNumber,
              pin: textArray[6],
            };
    
            // hashes the user pin and updates the userData object
            bcrypt.hash(userData.pin, 10, (err, hash) => {
              userData.pin = hash;
            });
    
            // create user and register to DB
            let user = await User.create(userData);

             // create savings account for user
            let savingsAccount = await PersonalSavings.create({
              user: user._id,
              balance: 0
            });

            // update user with savings account
            user.savingsAccount = savingsAccount._id;
            user.save();

            return user;
          }
    
          // Assigns the created user to a variable for manipulation
          let user = await createUser();
          // If user creation failed
          if (!user) {
            response = "END An unexpected error occurred... Please try again later";
          }
          // if user creation was successful
          else {
            let userName = user.FirstName;
            let phoneNumber = user.number;
            
        // Call the sendSMS function after successful registration
            sendSMS2(phoneNumber, "Congratulations! You have successfully registered with Pollen.");
            response = `END Congratulations ${userName}, You've been successfully registered with Pollen. Dial *384*199726# to start using our services`;
          }
        }
        }
        break;
      default:
        break;
    }
    return response;
  },
  
    

  
  
};

module.exports = menu;