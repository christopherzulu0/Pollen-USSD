
function handleDebts(textArray,phoneNumber){
  let response = '';
  const level = textArray.length;
 
  if (level == "") {
   response = `CON 
               1. Deposit Funds
               2. Request Loan
               3. Balances
               4. Other Actions
               `;

    return response;
  }
    
  // Handle join circle and create circle options here
  // ...
};


module.exports = handleDebts;
