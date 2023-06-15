const { CircleSavings } = require('./CircleController');
const { MainMenu } = require('./menu');
const { Transaction, Wallet, User, Savings, PersonalSavings } = require('./models/Schemas');
const menu = require('./menu'); 

const Personal_Savings = {
  PersonalSavings: async (textArray, phoneNumber, userName, total, day, loans, totalRequests) => {
    let level = textArray.length;
    let response = "";

    const user = await User.findOne({ number: phoneNumber });
    const bal = await Wallet.findOne({ user: user._id });
    const mybalance = bal ? bal.balance : 0;

    const savingsbalance = await PersonalSavings.findOne({ user: user._id });
    const savings = savingsbalance ? savingsbalance.balance : 0;

    switch (level) {
      case 1:
        response = `CON Earn interest on your digital Dollars via Defi, current interest rate:
          [APY]%
          Your wallet balance: K${mybalance}
          Your savings balance: K${savings}

          1. Deposit to savings
          2. Withdraw from savings
          99. Go Back
          `;
        break;
      case 2:
        if (textArray[1] == 1) {
          response = `CON Enter an amount to deposit to savings.
            Available wallet balance:
            K${mybalance}
          `;
        } else if (textArray[1] == 2) {
          response = `CON Enter an amount to withdraw from savings.
                      Available savings balance: K${savingsbalance.balance}
                      99. Go Back
                     `;
        }
        break;
      case 3:
        let amount = textArray[2];

        if (textArray[1] == 1) {
          if (amount > bal.balance) {
            response = `CON You have insufficient balance
                        99. Go Back
                       `;
            return response;
          } else {
            response = `CON Enter your pin to deposit K${amount} into savings.
              `;
          }
        } else if (textArray[1] == 2) {
          if (amount > savingsbalance.balance) {
            response = `CON You have insufficient savings balance
                         99. Go Back
                        `;
            return response;
          } else {
            response = `CON Enter your pin to withdraw K${amount} from savings.
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
            response = `CON Successfully deposited K${amount} to your savings account. Your new savings balance is K${savingsbalance.balance}.
                         99. Go Back
                        `;
          } else if (textArray[1] == 2) {
            // Deduct amount from savings balance
            savingsbalance.balance -= amount;
            // Add amount to wallet balance
            bal.balance = Number(bal.balance) + Number(amount);
            await savingsbalance.save();
            await bal.save();
            response = `CON Successfully withdrew K${amount} from your savings account. Your new savings balance is K${savingsbalance.balance}.
                       99. Go Back
                      `;
          }
          return response;
        }
      default:
        break;
    }

    return response;
  }
};

module.exports = Personal_Savings;
