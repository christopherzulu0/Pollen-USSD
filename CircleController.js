const {Transaction, Wallet, User,Savings} = require('./models/Schemas');
const handleNonRegisteredUser = require("./CircleJoin");
const handleMember = require("./MemberView");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const qs = require("qs");
const axios = require("axios");
const handleAdmin = require("./AdminView");





const CircleController = {
  CircleSavings: async (textArray, phoneNumber) => {
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
    let user = await confirmDetails();
  
    if (user) {
      return handleMember(textArray, phoneNumber);
    }
  
    const member = await Savings.findOne({
      "GroupMembers.MemberPhoneNumber": phoneNumber,
    });
  
    if (member) {
      return handleMember(textArray, phoneNumber);
    }
  
    return handleNonRegisteredUser(textArray, phoneNumber);
  }
  
};

module.exports = CircleController;
