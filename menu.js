const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');
const axios = require("axios");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const qs = require("qs");
const { response } = require('express');



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
  MainMenu: (userName,total,das,loans,totalRequests) => {
    
     if(loans){
      const requestsCount = totalRequests || 0;
      const response = `CON Welcome Back! ${userName}
      Loan Balance: <b>K${total}</b>
      Loan due in: <b>${das} Days</b>
      Please choose an option:
      1. Circle Savings
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
      const response = `CON Welcome Back! ${userName}
      Please choose an option:
      1. Circle Savings
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
  }
  ,
  

  PersonalSavings: async (textArray, phoneNumber) => {
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
                    Your wallet balance: $${mybalance}
                    Your savings balance: $${savings}
  
                    1. Deposit to savings
                    2. Withdraw from savings
                    `;
        break;
      case 2:
        if (textArray[1] == 1) {
          response = `CON Enter an amount to deposit to savings.
                      Available wallet balance:
                      $${mybalance}
          `;
        } else if (textArray[1] == 2) {
          response = `CON Enter an amount to withdraw from savings.
                       Available savings balance: $${savingsbalance.balance}
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
            response = `CON Enter your pin to deposit $${amount} into savings.
                        `;
          }
        } else if (textArray[1] == 2) {
          if (amount > savingsbalance.balance) {
            response = `END You have insufficient savings balance`;
            return response;
          } else {
            response = `CON Enter your pin to withdraw $${amount} from savings.
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
            response = `END Successfully deposited $${amount} to your savings account. Your new savings balance is $${savingsbalance.balance}.`;
          } else if (textArray[1] == 2) {
            // Deduct amount from savings balance
            savingsbalance.balance -= amount;
            // Add amount to wallet balance
            bal.balance = Number(bal.balance) + Number(amount);
            await savingsbalance.save();
            await bal.save();
            response = `END Successfully withdrew $${amount} from your savings account. Your new savings balance is $${savingsbalance.balance}.`;
          }
          return response;
        }
      default:
        break;
    }
  
    return response;
}

  ,
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
    let response= "";
    if (level == 1) {
      response = `CON Enter mobile number of the receiver:`;
      return response;
    } if (level == 2) {
    response = `CON Enter amount:`;
      return response;
    } if (level == 3) {
   response = `CON Enter your PIN:`;
      return response;
    } if (level == 4) { 
     const receiverNumber = countryCode(textArray[1]);
       const receivers = await User.findOne({ number: receiverNumber});
      if (!receivers) {
        return (response = "END This user has not signed up for Pollen.Would you like to invite them to Join?You can send or request payment once they join.\n 1. Yes \n 2. No");
      } else {
        const receiverNumber = countryCode(textArray[1]);
          const receiver = await User.findOne({ number:receiverNumber});
        const receiverWallets = await Wallet.findOne({ user: receiver._id });
        // let receiverAmount = receiverWallets ? receiverWallets.balance:0;
        console.log(receiverWallets);

        const user = await User.findOne({ number: phoneNumber });
        const sender = await Wallet.findOne({ user: user._id });
        console.log(sender);

        let senderName = user.FirstName;
        let receiverName = receiver.FirstName;
        let amount = parseInt(textArray[2]);
        const senderWallet = sender.balance;
        let senderPin = user.pin;
        console.log(senderPin)
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
    const level = textArray.length;

    const user = await User.findOne({ number: phoneNumber });
    const bal = await Wallet.findOne({ user: user._id });
    const mybalance = bal ?  bal.balance : 0;

  
    const savingsbalance = await PersonalSavings.findOne({ user: user._id });
    const savings = savingsbalance ? savingsbalance.balance:0;
    
    
    if(level === 1){
      response = `CON View your account balances
      
      Wallet balance: K${mybalance}
      Savings balance:K ${savings}
      `;

      const userCircles = await Savings.find({ 
        $or: [
          { 'GroupMembers.MemberPhoneNumber': phoneNumber },
          { 'GroupMembers.Creator': phoneNumber },
          { 'GroupMembers.AdminNumber1': phoneNumber },
          { 'GroupMembers.AdminNumber2': phoneNumber }
        ]
       });

    response += `
    Select a circle to view balance :\n`;
    userCircles.forEach((circle, index) => {
      response += `${index + 1}. ${circle.GroupName}\n`;
    });
   
      return response;
    }if (level === 2) {
      const selectedCircleIndex = parseInt(textArray[1]) - 1;
      const userCircles = await Savings.find({ 
        $or: [
          { 'GroupMembers.MemberPhoneNumber': phoneNumber },
          { 'GroupMembers.Creator': phoneNumber },
          { 'GroupMembers.AdminNumber1': phoneNumber },
          { 'GroupMembers.AdminNumber2': phoneNumber }
        ]
       });
      const selectedCircle = userCircles[selectedCircleIndex];

      if (!selectedCircle) {
        response = `END Invalid circle input. Please select a valid circle number.`;
        return response;
      }
    
       //Get the balance for the selectedCircle
      const circleBalance =selectedCircle ? selectedCircle.circleBalance[0].Balance : 0;

     
    //   const contributions = Object.values(selectedCircle.MemberContribution);
    //   const TotalEarned =contributions.reduce((sum, member) => sum + member.Contributed,0);

    // console.log("phone:",contributions.MemberPhoneNumber)

    const userd = await User.findOne({ number: phoneNumber });
    const ContributedNumber = userd.number;
    const contributedCircle = selectedCircle.MemberContribution.findIndex((member) => member.MemberPhoneNumber === ContributedNumber);
    const availableContribution = selectedCircle.MemberContribution[contributedCircle];
    const earns = availableContribution ? availableContribution.Contributed:0;

      const groupMembers = selectedCircle.GroupMembers.length;
      const interest = Object.values(selectedCircle.circleBalance);
      const totalInterest = interest.reduce((sum, interests) => sum + interests.LoanInterest, 0);
      const individualInterest =(totalInterest / groupMembers).toFixed(2);
      

    
      response = `END 
                  Group Balance: K${circleBalance}
                  Your Contribution:  K${earns} 
                  Penalties = K
                  Your interest earned:${individualInterest}%
                  
                  `;
      return response;
    }
   
  },  
  Notification: async (textArray, phoneNumber) => {
    let response = "";
    const level = textArray.length;
  
    const userCircles = await Savings.find({
      $or: [
        { 'GroupMembers.MemberPhoneNumber': phoneNumber },
        { 'GroupMembers.Creator': phoneNumber },
        { 'GroupMembers.AdminNumber1': phoneNumber },
        { 'GroupMembers.AdminNumber2': phoneNumber }
      ]
    });
  
    if (level === 1) {
      response = `CON <b>Notifications Menu</b>\n`;
  
      if (userCircles && userCircles.length > 0) {
        userCircles.forEach((circle, index) => {
          response += `${index + 1}. <b>${circle.GroupName}</b>\n`;
  
          const loanRequests = circle.LoanRequest;
          if (loanRequests && loanRequests.length > 0) {
            response += `Pending Loan Votes(<b>${loanRequests.length}</b>):\n`;
  
            loanRequests.forEach((request, i) => {
              response += `${i + 1}. ${request.Name} (<b>K${request.LoanAmount}</b> for ${request.LoanReason})\n`;
            });
          } else {
            response += `No pending loan votes\n`;
          }
  
          response += '\n';
        });
      } else {
        response += `No user circles found\n`;
      }
    }
  
    return response;
  }
  
  
};

module.exports = menu;
