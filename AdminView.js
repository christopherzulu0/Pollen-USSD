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
  // Implement logic for registered users
  // Checks DB for the receivers details and returns the value

  //Member View
  // async function confirmDetails() {
  //   let member = await Savings.findOne({"GroupMembers.MemberPhoneNumber": phoneNumber});
  //   return member;
  // }

  // // Assigns the user to a variable for manipulation
  // let member = await confirmDetails();

  // if (member) {
  //   return handleMember(textArray, phoneNumber);
  // } else {
  //   response =`END You are not authorised to view this page `
  //   ;

  //   return response;
  // }


  async function confirmDetails() {
    let user = await User.findOne({ number: phoneNumber });
    return user;
  }

  
  // Assigns the user to a variable for manipulation
  let user = await confirmDetails();
  
    let response = "";
   
    const level = textArray.length;
  
    if (level == 1) {
      let firstName = user.FirstName;
      response = `CON Welcome, ${firstName}!
      1. Invite Members`;
      return response;
    } else if (level == 2 && textArray[1] == 1) {
      response = `CON Enter the number you want to invite to the circle`;
      return response;
    } else if (level == 3) {
      const userNumber = countryCode(textArray[2]);
      let user = await User.findOne({ number: userNumber });
      if (user) {
        let circleMember = textArray[2];
        response = `CON ${circleMember}, has been invited to join your circle.
                    1. Add to invite list`;

                    async function confirmDetails() {
                      let user = await Savings.findOne({ number: phoneNumber });
                      return user;
                    }
                
                    // Assigns the user to a variable for manipulation
                    let user = await confirmDetails();
                
                 
            
      } else {
        let circleMember = textArray[2];
        response = `CON ${circleMember}, has been invited to Pollen and join your circle.
                    1. Add to invite list`;

                    async function confirmDetails() {
                      let user = await Savings.findOne({ number: phoneNumber });
                      return user;
                    }
                
                    // Assigns the user to a variable for manipulation
                    let user = await confirmDetails();
                
                    let code = user.GroupCode;
                   
        await Savings.findOneAndUpdate(
          { GroupCode: code },
          { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
          { new: true, upsert: true }
        );
      }
      return response;
    } else if (level == 4 && textArray[3] == 1) {
      let user = await Savings.findOne({ number: phoneNumber });
      let code = user.GroupCode;
      let name = user.GroupName;
      await Savings.findOneAndUpdate(
        { GroupCode: code },
        { $push: { InvitedMembers: { InvitedNumber: textArray[2] } } },
        { new: true, upsert: true }
      );


     
      response = `CON ${textArray[2]}, has been invited to join ${name} and added to the invite list`;
      return response;
    }
    

         
        
        // if(level == 2 && textArray[1] == 1){
        //   response = `CON Enter Your Name`;
        //   return response;
        // }if(level == 3){
        //   response = `CON Enter the name of your province`;
        //   return response;
        // }if(level == 4){
        //   response = `CON Enter the invite code for the group you want to join`;
        //   return response;
        // }if(level == 5){
        //   // Find the group with the invite code
        //   let group = await Savings.findOne({ InviteCode: textArray[4]});
        //   if (!group) {
        //     response = "END Group not found. Please check the invite code and try again.";
        //     return response;
        //   }else if(group){
        //     response = `CON Please confirm the circle before joining.
        //                 GovType: ${group.GovType}
        //                 CircleName: ${group.GroupName}
        //                 Deposit goal per mo: ${group.DepositGoal}
        //                 Late penalty: ${group.Penalty}
                        
        //                 1.Confirm & Join
        //                 2.Cancel
        //     `;
        //     return response;
        //   }
        // }if (level == 6 && textArray[5] == 1) {
        //   // Check if the user is already in a circle and not in the current GroupMembers
        //   const memberInCircle = await Savings.findOne({
        //     AdminNumber: phoneNumber,
        //     "GroupMembers.GroupCode": { $ne: textArray[4] },
        //   });
        
        //   // Check if the user is already a member of the group
        //   const member = await Savings.findOne({
        //     "GroupMembers.MemberPhoneNumber": phoneNumber,
        //     "GroupMembers.GroupCode": textArray[4],
        //   });
        
        //   if (memberInCircle) {
        //     response = "END You are an Admin and cannot join this group.";
        //     return response;
        //   } else if (member) {
        //     response = "END You are already a member of this circle.";
        //     return response;
        //   }
        
        //   // Join the group
        //   const group = await Savings.findOneAndUpdate(
        //     { GroupCode: textArray[4] },
        //     {
        //       $push: {
        //         GroupMembers: {
        //           MemberName: textArray[2],
        //           Province: textArray[3],
        //           MemberPhoneNumber: phoneNumber,
        //         },
        //       },
        //     },
        //     { new: true }
        //   );
        
        //   response = `END You have successfully joined the ${group.GroupName} group.`;
        // }
        
        
        
        // if(level == 2 && textArray[1] == 2){
        //   response = `CON Enter your fullname`;
        //   return response;
        // }if(level == 3 ){
        //   response = `CON The Government type can be 
        //               1.Admin 
        //               2.Multi-Admin 
        //               3.1 vote per person 
        //               4.1 vote per $ deposit
        //             `;
        //   return response;
        // }if(level == 4 && textArray[3] ==1 ){
        //   response = `CON Enter group name`;
        //   return response;
        // }if(level == 5 ){
        //   response = `CON Enter deposit  goal`;
        //   return response;
        // }if(level == 6 ){
        //   response = `CON Enter new group Invite code `;
        //   return response;
        // }if(level == 7 ){
        //   response = `CON Enter penalty fee`;
        //   return response;
        // }if(level == 8){
        //   response = `CON Verfiy info before continuing
        //                Gov Type = Admin
        //                Admins = ${textArray[3]}
        //                Circle Name =  ${textArray[4]}
        //                Deposit Goal = ${textArray[5]}
        //                Late Penalty = ${textArray[7]}

        //                1.Confirm & Continue
        //                2.Redo
        //              `;
        //   return response;
        // }if(level == 9 && textArray[9] == 1 ) {
        //   // proceed to register user
        //   async function createGroup() {
           
        //     const SavingsData = {
        //      AdminNumber: phoneNumber,
        //      AdminName: textArray[2],
        //      GovType: textArray[3], 
        //      AdminNumber: textArray[4], 
        //      GroupName: textArray[5],
        //      DepositGoal: textArray[6],
        //      GroupCode: textArray[7],
        //      Penalty: textArray[8],
        //     };
            
    
        //     // create user and register to DB
        //     let Member = await Savings.create(SavingsData);
        //     return Member;
        //   }
    
        //   // Assigns the created user to a variable for manipulation
        //   let Member = await createGroup();
        //   // If user creation failed
        //   if (!Member) {
        //     response = "END An unexpected error occurred... Please try again later";
        //   }
        //   // if user creation was successful
        //   else {
        //     let owner =Member.AdminName;
        //     let code = Member.GroupCode;
            
        // // Call the sendSMS function after successful registration
        //     // sendSMS2(phoneNumber, "Congratulations! You have successfully registered with Pollen.");
        //     response = `END Congratulations ${owner}, You have successfully registered the group. Your group invite code is ${code} .`;
        //   }
        // }


  
};

module.exports = handleAdmin;
