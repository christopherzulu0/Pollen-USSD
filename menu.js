const {Transaction, Wallet, User,Savings} = require('./models/Schemas');
const axios = require("axios");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const qs = require("qs");



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
  }
  ,
  

  CheckBalance: async (textArray) => {
    let response = "END This balance checking will be available soon...";
    return response;
  },
  WithdrawMoney: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = '';
    let amount = 0;
    let user = null;
    
    switch (level) {
      case 1:
        response = `CON Select an action. Deposits are converted to digital US Dollar stablecoins.
                  1. Deposit from MoMo
                  2. Withdraw from Momo
                   `;
        break;
      case 2:
        if (textArray[1] == 1) {
          response = `CON Enter amount to deposit:`;
        } else if (textArray[1] == 2) {
          response = `CON Enter amount to withdraw:`;
        } else {
          response = "END Invalid entry.";
        }
        break;
      case 3:
        amount = parseFloat(textArray[2]);
        if (isNaN(amount) || amount <= 0) {
          response = "END Invalid amount. Please enter a valid amount.";
          break;
        }
  
        user = await User.findOne({ number: phoneNumber });
       
        if (!user) {
          response = "END User not found.";
          break;
        }
        let wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
          wallet = new Wallet({ user: user._id, balance: 0 });
          await wallet.save();
        }
        if (textArray[1] == 1) {
          wallet.balance += amount;
          await wallet.save();
          response = `END K${amount} has been added to your wallet. Your new balance is K${wallet.balance}.`;
        } else if (textArray[1] == 2) {
          response = `CON Enter your PIN:`;
        } else {
          response = "END Invalid entry.";
        }
        break;
      case 4:
        amount = parseFloat(textArray[2]);
        const pin = textArray[3];
        if (isNaN(amount) || amount <= 0) {
          response = "END Invalid amount. Please enter a valid amount.";
          break;
        }
        user = await User.findOne({ number: phoneNumber });
  
        if (!user) {
          response = "END User not found.";
          break;
        }
        if ( pin !==  user.pin) {
          response = "END Invalid PIN.";
          break;
        }
        let walletWithdraw = await Wallet.findOne({ user: user._id });
        if (!walletWithdraw) {
          response = "END Insufficient balance.";
          break;
        }
        if (walletWithdraw.balance < amount) {
          response = "END Insufficient balance.";
          break;
        }
        walletWithdraw.balance -= amount;
        await walletWithdraw.save();
        response = `END K${amount} has been withdrawn from your wallet. Your new balance is K${walletWithdraw.balance}.`;
        break;
      default:
        response = "END Invalid entry.";
        break;
    }
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
  
      async function confirmDetails() {
        const userNumber = countryCode(textArray[1]);
        let user = await User.findOne({ number: userNumber });
        return user;
      }
  
     
      let receiver = await confirmDetails();
      if (!receiver) {
        return (response = "END This user has not signed up for Pollen.Would you like to invite them to Join?You can send or request payment once they join.\n 1. Yes \n 2. No");
      } else {
        
        async function confirmDetails() {
          const userNumber = countryCode(textArray[1]);
          let user = await User.findOne({ number: userNumber });
          return user;
        }
    
       
        let receiver = await confirmDetails();
        const receiverWallets = await Wallet.findOne({ user: receiver._id });
        console.log(receiverWallets);

        const user = await User.findOne({ number: phoneNumber });
        const sender = await Wallet.findOne({ user: user._id });
        console.log(sender);

        let senderName = user.FirstName;
        let receiverName = receiver.FirstName;
        let amount = parseInt(textArray[2]);
        const senderWallet = sender.balance;
        let senderPin = user.pin;
  
        // validate the pin
        if (textArray[3] != senderPin) {
          return (response = "END Invalid Pin. Transaction cancelled.");
        }
  
        // check if sender has enough funds
        if (amount > senderWallet) {
          return (response = "END Insufficient funds. Transaction cancelled.");
        }
  
        // deduct from sender's balance and add to receiver's balance
        sender.balance -= amount;
        receiverWallets.balance += amount;
  
        sender.balance = sender.balance;
       receiverWallets.balance =  receiverWallets.balance;
  
        await sender.save();
        await receiverWallets.save();
  
        // create transaction records
        let senderTransaction = new Transaction({
          type: "debit",
          amount: amount,
          balance: sender.balance,
          user: sender._id,
          description: `Sent K${amount} to ${senderName}`
        });
        let receiverTransaction = new Transaction({
          type: "credit",
          amount: amount,
          balance: receiverWallets.balance,
          user: receiver._id,
          description: `Received K${amount} from ${receiverName}`
        });
        await senderTransaction.save();
        await receiverTransaction.save();
  
        response = `END Your payment of K${amount} to ${receiverName} has been submitted.\nYou will receive an SMS notification once it is complete.`;
      }
  
      return response;
    } else if (level == 5 && textArray[4] == 2) {
      return (response = "END Cancelled. Thank you for using our service");
    } else {
      return (response = "END Invalid entry");
    }
  },  
  CheckBalance: async (textArray,phoneNumber) => {
    let response = "";
    let text ="";

    const user = await User.findOne({ number: phoneNumber });
        const mybalance = await Wallet.findOne({ user: user._id });

    if(text == ""){
      response = `CON View your account balances
      
      Your wallet balance $${mybalance.balance}
      Your savings balance $
      Your circle balance $
      `;
      return response;
    }
  },
};

module.exports = menu;
