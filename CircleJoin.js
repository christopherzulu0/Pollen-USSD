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

const credentials = {
  apiKey: process.env.apiKey,
  username: process.env.username
};


// Function for selecting Admin type
const selectAccountType = () => {
  return `CON The Government type can be 
          1.General Village Banking Account 
          2.Fixed Village Banking Account 
        `;
};

const defaultValues = {
  General: {
    govTypeName: "General VB"
  },
 Fixed: {
    govTypeName: "Fixed VB"
  }
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
                  Admin1: ${group.Creator}
                  Admin2: ${group.AdminNumber1}
                  Admin3: ${group.AdminNumber2}
                  CircleName: ${group.GroupName}
                  Deposit goal per mo: ${group.DepositGoal}
                  Rate: ${group.Rate}
                  
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
    $or: [
      { AdminNumber1: phoneNumber },
      { AdminNumber2: phoneNumber },
      { Creator: phoneNumber },
    ],
    "GroupMembers.GroupCode": { $ne: textArray[2] },
  });

  // Check if the user is already a member of the group
  const user = await User.findOne({ number: phoneNumber });
  const number = user.number;
  const member = await Savings.findOne({
    "GroupMembers.MemberPhoneNumber": number,
    "GroupMembers.GroupCode": textArray[2],
  });

  // Check if the user is already in the invited list
  const invited = await Savings.findOne({
    "InvitedMembers.InvitedNumber": number,
    "InvitedMembers.GroupCode": textArray[2],
  });

  if (memberInCircle) {
    response = "END You are an Admin and cannot join this group.";
    return response;
  } else if (member) {
    response = "END You are already a member of this circle.";
    return response;
  } else if (!invited) {
    response = "END You are not invited to join this circle";
    return response;
  }

  // Join the group
  const group = await Savings.findOneAndUpdate(
    { GroupCode: textArray[2] },
    {
      $push: {
        GroupMembers: {
          MemberPhoneNumber: number,
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
    response = selectAccountType();
    return response;
  }if(level === 4 && textArray[3] == 1 ){  
    response = `CON Saving goal (General Village Banking)`;
    return response;
  } else if(level === 4 && textArray[3] == 2){  
    response = `CON Saving goal (Fixed Village Banking)`;
    return response;
  } else if(level === 5 ){
    response = `CON Input interest rate`;
    return response;
  }else if(level === 6) {
    response = `CON Input Min_Contribution`;
    return response;
}else if(level === 7 ){
  response = `CON Input Max_Contribution`;
  return response;
}else if(level === 8) {
  response = `CON Input charge for late contribution`;
  return response;
}else if(level === 9 ){
    response = `CON Input admin 1 number`;
    return response;
  }else if(level === 10) {
    response = `CON Input admin 2 number`;
    return response;
}else if(level === 11){
  const govType = textArray[3];
  let defaults;

  if (govType == 1) {
    defaults = defaultValues.General;
  } else if (govType == 2) {
    defaults = defaultValues.Fixed;
  } else {
    // handle invalid government type
    response = `END Invalid government type`;
    return response;
  }
    response = `CON Verify info before continuing
                  AccountType: ${defaults.govTypeName}
                  InterestRate:${textArray[5]}%
                  Min_Contribution: ${textArray[6]}
                  Max_Contribution: ${textArray[7]}
                  SavingGoal: ${textArray[4]}
                  PenaltyCharge: ${textArray[8]}
                  Admin1: ${textArray[9]}
                  Admin2: ${textArray[10]}
                        
                 1.Confirm & Finish making a circle
                 2. Redo
                 `;
    return response;
  }

  
  if(level == 12 && textArray[11] == 1){
    // proceed to register user
    const groupCode = shortid.generate(); // generate a unique invite code
    const govType = textArray[3];
    let savingsData;
  
    const groupMembers = [
      { Creator: phoneNumber, JoinedOn: new Date() },
      { AdminNumber1: textArray[9], JoinedOn: new Date() },
      { AdminNumber2: textArray[10], JoinedOn: new Date() }
    ];

    const createdDate = new Date();
    Savings.createdDate = createdDate;

    const closingDate = new Date();
   closingDate.setMonth(closingDate.getMonth() + 1); // Set the due date to one month from the disbursed date
    Savings.closingDate =closingDate;
    
    if (govType == 1) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[9],
        AdminNumber2: textArray[10],
        AccountType: "General VB",
        MinContribution: textArray[6],
        MaxContribution: textArray[7],
        GroupName: textArray[2],
        PenaltyCharge: textArray[8],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        InterestRate: textArray[5],
        GroupMembers: groupMembers,
        createdDate: createdDate,
        closingDate: closingDate
      };
    } else if (govType == 2) {
      savingsData = {
        Creator:phoneNumber,
        AdminNumber1:textArray[9],
        AdminNumber2: textArray[10],
        AccountType: "Fixed VB",
        MinContribution: textArray[6],
        MaxContribution: textArray[7],
        GroupName: textArray[2],
        PenaltyCharge: textArray[8],
        DepositGoal: textArray[4],
        GroupCode: groupCode,
        InterestRate: textArray[5],
        GroupMembers: groupMembers
      };
  
    }else {
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
