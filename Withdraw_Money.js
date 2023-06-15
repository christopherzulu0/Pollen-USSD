const {Transaction, Wallet, User,Savings,PersonalSavings} = require('./models/Schemas');

const Withdraw_Money = {
    
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
                      99. Go Back
                       `;
            break;
          case 2:
            if (textArray[1] == 1) {
              response = `CON Enter amount to deposit:`;
            } else if (textArray[1] == 2) {
              response = `CON Enter amount to withdraw:`;
            } else {
              response = "CON Invalid entry.\ 99. Go Back";
            }
            break;
          case 3:
            amount = parseFloat(textArray[2]);
            if (isNaN(amount) || amount <= 0) {
              response = "CON Invalid amount. Please enter a valid amount.\ 99. Go Back";
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
              response = `CON K${amount} has been added to your wallet. Your new balance is K${wallet.balance}.\ 99. Go Back`;
            } else if (textArray[1] == 2) {
              response = `CON Enter your PIN:`;
            } else {
              response = "CON Invalid entry.\ 99. Go Back";
            }
            break;
          case 4:
            amount = parseFloat(textArray[2]);
            const pin = textArray[3];
            if (isNaN(amount) || amount <= 0) {
              response = "CON Invalid amount. Please enter a valid amount.\ 99. Go Back";
              break;
            }
            user = await User.findOne({ number: phoneNumber });
      
            if (!user) {
              response = "CON User not found.\ 99. Go Back";
              break;
            }
            if ( pin !==  user.pin) {
              response = "CON Invalid PIN.\ 99. Go Back";
              break;
            }
            let walletWithdraw = await Wallet.findOne({ user: user._id });
            if (!walletWithdraw) {
              response = "CON Insufficient balance.\ 99. Go Back";
              break;
            }
            if (walletWithdraw.balance < amount) {
              response = "CON Insufficient balance.\ 99. Go Back";
              break;
            }
            walletWithdraw.balance -= amount;
            await walletWithdraw.save();
            response = `CON K${amount} has been withdrawn from your wallet. Your new balance is K${walletWithdraw.balance}.\ 99. Go Back`;
            break;
          default:
            response = "CON Invalid entry.\ 99. Go Back";
            break;
        }
        return response;
      }
  
  
};

module.exports = Withdraw_Money;