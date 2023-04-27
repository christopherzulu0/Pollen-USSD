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

    if(level === 3 ){
      response = `CON Choose an option
                1.Invite Members
                2.Pending Votes
                3.Delete User
                4.Block User
                5.Delete Circle
                `;
      return response;
    }
    switch (textArray[3] ) {
        case '1':
          response = `END invite members`;
          break;
        case '2':
          response = `END pending votes`;
          break;
        case '3':
          response = `END delete user`;
          break;
        case '4':
          response = `END block user`;
          break;
        case '5':
          response = `END delete circle`;
          break;
        default:
          response = `END Invalid option selected`;
          break;
      }
      
      return response;
      
  
};

module.exports = handleAdmin;
