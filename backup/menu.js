const User = require("./models/user");
const Circle = require("./models/circle");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const { response } = require("express");

const mongoose = require("mongoose");


mongoose.connect("mongodb+srv://pollen:87064465@cluster0.7brxwgz.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const menu = {
  MainMenu: (userName) => {
    const response = `CON Welcome ${userName}, which action you wish to perform ?
            1. Circle Savings
            2. Personal Savings
            3. View Balances
            4. Payments
            5. Deposit/Withdraw from Momo
            6. Help

            `;

    return response;
  },
  unregisteredMenu: () => {
    const response = `CON Welcome to Pollen. The best banking platform in Zambia.
            1. Register
            `;

    return response;
  },
  Register: async (textArray, phoneNumber) => {
    const level = textArray.length;
    if (level == 1) {
      let response =
        "CON You're about to create an account with Pollen.Please enter your first name:";
      return response;
    } else if (level == 2) {
      response = `CON Enter your last name`;
      return response;
    } else if (level == 3) {
      response = `CON Enter your email address`;
      return response;
    } else if (level == 4) {
      response = `CON Enter your date of birth`;
      return response;
    } else if (level == 5) {
      response = `CON Enter your nrc number`;
      return response;
    } else if (level == 6) {
      let response = "CON Please choose a 5-digit PIN to secure your account:";
      return response;
    } else if (level == 7) {
      let response = "CON Please confirm your PIN:";
      return response;
    } else if (level == 8) {
      const pin = textArray[6];
      const confirmPin = textArray[7];
      // Check if the name is strictly alphabets via regex
      if (/[^a-zA-Z]/.test(textArray[1])) {
        return (response =
          "END Your full name must not consist of any number or symbol. Please try again");
      } // Check if the pin is 5 characters long and is purely numerical
      else if (pin.toString().length != 6 && isNaN(pin)) {
        return (response =
          "END Your pin does not follow our guidelines. Please try again");
      } // Check if the pin and confirmed pin is the same
      else if (pin != confirmPin) {
        return (response = "END Your pins do not match. Please try again");
      } else {
        // proceed to register user
        let response = "";
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
          return user;
        }

        // Assigns the created user to a variable for manipulation
        let user = await createUser();
        // If user creation failed
        if (!user) {
          response =
            "END An unexpected error occurred... Please try again later";
        }
        // if user creation was successful
        else {
          let userName = user.FirstName;
          response = `END Congratulations ${userName}, You've been successfully registered with Pollen.
          Dial *384*199726# to start using our services`;
          // Call the sendRegistrationMessage function to send the message to the user's phone number
          // sendRegistrationMessage(phoneNumber);
        }
       
        return response;
      }
    }
  },
  CircleSavings: async (textArray, phoneNumber) => {
    const level = textArray.length;
    
    if (level == 1) {
      let response =
        `CON You're about to create a Circle Group with Pollen.
        Please enter your Group Name:`;
      return response;
    }else if (level == 2) {
      let response = "CON Group code:";
      return response;
    } else if (level == 3) {
      let response = "CON Please confirm your Group Code:";
      return response;
    } else if (level == 4) {
      const GroupCode = textArray[2];
      const confirmGroupCode = textArray[3];
      // Check if the name is strictly alphabets via regex
      if (/[^a-zA-Z]/.test(textArray[1])) {
        return (response =
          "END Your group name must not consist of any number or symbol. Please try again");
      } // Check if the pin is 5 characters long and is purely numerical
      else if (GroupCode.toString().length != 2 && isNaN(GroupCode)) {
       response =`END Your pin does not follow our guidelines. Please try again`;
       return response;
      } // Check if the pin and confirmed pin is the same
      else if (GroupCode != confirmGroupCode) {
       response = `END Your pins do not match. Please try again`;
        return response;
      } else {
        // proceed to register user
        let response = "";
        async function createCircle() {
          const CircleData = {
            GroupName: textArray[1],
            GroupCode: textArray[2],
            number: phoneNumber,
          };
          // hashes the user pin and updates the userData object
          bcrypt.hash(CircleData.GroupCode, 10, (err, hash) => {
            CircleData.GroupCode = hash;
          });

          // create user and register to DB
          let usercircle = await Circle.create(CircleData);
          return usercircle;
        }

        // Assigns the created user to a variable for manipulation
        let usercircle = await createCircle();
        // If user creation failed
        if (!usercircle) {
          response =
            "END An unexpected error occurred... Please try again later";
        }
        // if user creation was successful
        else {
          let GroupCode = usercircle.GroupCode;
          response = `END You've been successfully registered with Pollen.Your groupcode is ${GroupCode}

          Dial *384*199726# to start using our services`;
          
        }

        return response;
      }
    }
  },
  WithSavings: async (textArray) => {
  

    const level = textArray.length;
    if(level==1){
      let response="";
    response = `CON Earn interest in your digital Dollars via Defi.
                    Current interest rate:
                    [APY]%
                    Your wallet balance:$_______________
                    Your savings balance:$______________

                1. Deposit to savings
                2. Withdraw from Savings
                `;
                return response;

                
    }

   
   
  },
  CheckBalance: async (textArray) => {
    let response = "END This balance checking will be available soon...";
    return response;
  },
  SendMoney: async (textArray, phoneNumber) => {
    const level = textArray.length;
    if (level == 1) {
      return (response = "CON Enter mobile number of the receiver:");
    } else if (level == 2) {
      return (response = "CON Enter amount:");
    } else if (level == 3) {
      return (response = "CON Enter your PIN:");
    } else if (level == 4) {
      let response = "";

      // Checks DB for the receivers details and returns the value
      async function confirmDetails() {
        const userNumber = countryCode(textArray[1]);
        let user = await User.findOne({ number: userNumber });
        return user;
      }

      // Assigns the user to a variable for manipulation
      let user = await confirmDetails();
      // If user was not found in the DB
      if (!user ) {
        return (response = "END This user has not signed up for Pollen.Would you like to invite them to Join?You can send or request payment once they join.\n 1. Yes \n 2. No");
      }
      // if user was found and details were retrieved 0962591106
      else {
        let userName = user.FirstName;
        response = `CON You're about to send K ${textArray[2]} to ${userName}
      1. Confirm
      2. Cancel `;
      }

      return response;
    } else if (level == 5 && textArray[4] == 1) {
      // TODO check if PIN is correct
      // TODO send the money
      // TODO If the account has enough funds including charges etc..
      // TODO connect to DB
      // TODO Complete transaction
      pin = textArray[3];
      amount = textArray[2];

      return (response =
        "END We are processing your request. You will receive an SMS shortly");
    } else if (level == 5 && textArray[4] == 2) {
      //Cancel Transaction
      return (response = "END Canceled. Thank you for using our service");
    } else {
      return (response = "END Invalid entry");
    }
  },
  // WithdrawMoney: async (textArray) => {
  //   let response = "END This service will be available soon...";
  //   return response;
  // },
  // CheckBalance: async (textArray) => {
  //   let response = "END This service will be available soon...";
  //   return response;
  // },
};

module.exports = menu;
