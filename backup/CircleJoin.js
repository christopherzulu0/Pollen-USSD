const {Transaction, Wallet, User,Savings} = require('./models/Schemas');
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

const sendSMS3 = async (phoneNumber, message) => {
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





// Function for selecting Admin type
const selectAdminType = () => {
  return `CON The Government type can be 
          1.Admin 
          2.Multi-Admin 
          3.1 vote per person 
          4.1 vote per $ deposit
        `;
};

const defaultValues = {
  Admin: {
    govTypeName: "Admin",
    Admins: 1,
    VotingType: "N/A",
  },
  MultiAdmin: {
    govTypeName: "MultiAdmin",
    Admins: 3,
    VotingType: "N/A",
  },
  VotePerson: {
    govTypeName: "1 Vote per person",
    Admins: 1,
    VotingType: "1 Person = 1 Vote",
  },
  VoteDollar: {
    govTypeName: "1 vote per dollar",
    Admins: 1,
    VotingType: "1 Dollar = 1 Vote",
  },
};


// Function for handling non-registered users
const handleNonRegisteredUser = async (textArray, phoneNumber,Admin,MultiAdmin,VotePerson,VoteDollar) => {
  let response = "";
  let text = ''
  let level = textArray.length;
  

  if(level === 1){
    response = `CON Please choose an option
                1. Join a group
                2. Create a group
               `;
    return response;
  }if (level == 2 && textArray[1] == 1) {
    response = `CON Enter the invite code for the group you want to join`;
    return response;
  }if (level == 3 && textArray[1] == 1) {
    // Find the group with the invite code
    let group = await Savings.findOne({ GroupCode: textArray[2]});
    if (!group) {
      response = "END Group not found. Please check the invite code and try again.";
      return response;
    } else {
      response = `CON Please confirm the circle before joining.
                  GovType: ${group.GovType}
                  CircleName: ${group.GroupName}
                  Deposit goal per mo: ${group.DepositGoal}
                  Late penalty: ${group.Penalty}
                  
                  0.Confirm & Join
                  x. Cancel
                  
      `;
      return response;
    }
  }if (level == 4 && textArray[3] == 'x' ) {
     response = `END Bye! See you soon.`;
     return response;
  }
 if (level == 4 && textArray[3] == 0 ) {
    // Check if the user is already in a circle and not in the current GroupMembers
    const memberInCircle = await Savings.findOne({
      AdminNumber1: phoneNumber,
      AdminNumber2: phoneNumber,
      Creator: phoneNumber,
      "GroupMembers.GroupCode": { $ne: textArray[2] },
    });
    
    // Check if the user is already a member of the group
    const member = await Savings.findOne({
      "GroupMembers.MemberPhoneNumber": phoneNumber,
      "GroupMembers.GroupCode": textArray[2],
    });
    
    // Check if the user is already in the invited list
    
    
    if (memberInCircle) {
      response = "END You are an Admin and cannot join this group.";
      return response;
    } else if (member) {
      response = "END You are already a member of this circle.";
      return response;
    }
    
    
    
    //Check if the user in the Invited list
    async function confirmDetails() {
      let invited = await Savings.findOne({
        $or: [
          { "InvitedMembers.InvitedNumber": phoneNumber},
          {  "InvitedMembers.GroupCode": textArray[2]},
         
        ],
      });
      return invited;
    }
    
    // Assigns the user to a variable for manipulation
    let invited = await confirmDetails();
    
     if(!invited){
      response = "END You are not invited to join this circle";
      return response;
    }
    // Join the group
    const group = await Savings.findOneAndUpdate(
      { GroupCode: textArray[2] },
      {
        $push: {
          GroupMembers: {
            MemberPhoneNumber: phoneNumber,
          },
        },
      },
      { new: true }
    );
    
    if (group) {
      response = `END You have successfully joined the ${group.GroupName} group.`;
      return response;
    } else {
      response = "END An error occurred while joining the group.";
      return response;
    }
  }
   else if (level == 2 && textArray[1] == 2) {
    response = `CON Enter circle name`;
    return response;
  }
   if (level == 3 ) {
    response = selectAdminType();
    return response;
    
  }if(level === 4 && textArray[3] == 1 ){
    
    response = `CON Enter deposit goal(Admin)`;
    return response;
  } else if(level === 4 && textArray[3] == 2){  
    response = `CON Enter deposit goal(Multi-Admin)`;
    return response;
  } else if(level === 4 && textArray[3] == 3){  
    response = `CON Enter deposit goal(1 Vote per person)`;
    return response;
  } else if(level === 4 && textArray[3] == 4){  
    response = `CON Enter deposit goal(1 Vote per Dollar )`;
    return response;
  } else if(level === 5 ){
    response = `CON Enter penalty fee`;
    return response;
  }  else if(level === 6 ){
    response = `CON Enter Admin#1 number(E.g 260971488377)`;
    return response;
  }else if(level === 7) {
    response = `CON Add Admin#2 number(E.g 260971488377)`;
    return response;
}else if(level === 8){
    const govType = textArray[3];
    let defaults;

    if (govType == 1) {
      defaults = defaultValues.Admin;
    } else if (govType == 2) {
      defaults = defaultValues.MultiAdmin;
    } else if (govType == 3) {
      defaults = defaultValues.VotePerson;
    } else if (govType == 4) {
      defaults = defaultValues.VoteDollar;
    } else {
      // handle invalid government type
      response = `END Invalid government type`;
      return response;
    }
    response = `CON Verify info before continuing
                 Gov Type = ${defaults.govTypeName}
                 Admins = ${defaults.Admins}
                 Circle Name = ${textArray[2]}
                 Deposit Goal = ${textArray[4]}
                 Late Penalty = ${textArray[5]}

                 1.Confirm & Finish making a circle
                 2. Redo
                 `;
    return response;
  }
  
  // if(level == 9 && textArray[8] == 2){
  //   if (level == 2 && textArray[1] == 2) {
  //     response = `CON Enter circle name`;
  //     return response;
  //   }
  // }
  
  if(level == 9 && textArray[8] == 1){
    // proceed to register user
    const groupCode = shortid.generate(); // generate a unique invite code
    const govType = textArray[3];
    let savingsData;
  
    if (govType == 1) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[6],
        AdminNumber2: textArray[7],
        GovType: "Admin",
        GroupName: textArray[2],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        Penalty: textArray[5],
      };
    } else if (govType == 2) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[6],
        AdminNumber2: textArray[7],
        GovType: "Multi-Admin",
        GroupName: textArray[2],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        Penalty: textArray[5],
      };
  
    } else if (govType == 3) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[6],
        AdminNumber2: textArray[7],
        GovType: "1 Vote Per Person",
        GroupName: textArray[2],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        Penalty: textArray[5],
      };
    } else if (govType == 4) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[6],
        AdminNumber2: textArray[7],
        GovType: "1 Vote Person Per $",
        GroupName: textArray[2],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        Penalty: textArray[5],
      };
    } else {
      // handle invalid government type
      return 'END Invalid government type.';
    }
  
    // create group
    const newGroup = new Savings(savingsData);
    newGroup.save((err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Saved to database!');
    });
  
    const response = `END Group successfully created. Group Code is ${groupCode}`;
    return response;
  }
   
  
  
  
  
  
  

    
  };
  

module.exports = handleNonRegisteredUser;
