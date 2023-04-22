const mongoose = require('mongoose');
const shortid = require('shortid');



const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const personalsavingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
    
  }]
});

const UserSchema = mongoose.Schema({
    FirstName: {
       type: String,
       required: true,
     },
    LastName: {
       type: String,
       required: true,
     },
     Email: {
       type: String,
       required: true,
     },
     DOB: {
       type: String,
       required: true,
     },
    NationalID: {
       type: String,
       required: true,
     },
     number: {
       type: Number,
       required: true,
     },
     pin: {
       type: String,
       required:true
     },
     
   });

   const CircleSchema = mongoose.Schema({
    Creator: {
      type: Number,
      required: true,
    },
    AdminNumber1: {
      type: Number,
      required: true,
    },
    AdminNumber2: {
      type: Number,
      required: true,
    },
    AccountType: {
      type: String,
      required: true,
    },
    MinContribution: {
      type: Number,
      required: true,
    },
    MaxContribution: {
      type: Number,
      required: true,
    },
    GroupName: {
      type: String,
      required: true,
    },
    PenaltyCharge: {
      type: Number,
      required: true,
    },
    DepositGoal: {
      type: Number,
      required: true,
    },
    GroupCode: {
      type: String,
      default: shortid.generate, 
    },
    InterestRate: {
      type: Number,
      required: true,
    },
    LoanRequest: [{
      _id: {
        type: mongoose.Types.ObjectId,
        auto: true,
      },
      BorrowerNumber: {
        type: Number,
        required: true 
      },
      LoanReason: {
        type: String,
        required: true
      },
      LoanAmount: {
        type: Number,
        required: true,
        default: 0
      },
      ApprovalVotes: {
        type: [String],
        default: []
      },
      RejectionVotes: {
        type: [String],
        default: []
      },
      Approved: {
        type: Boolean,
        default: false
      },
      Rejected: {
        type: Boolean,
        default: false
      },
      Status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Pending Admin Approval'],
        default: 'Pending'
      }
    }],
    InvitedMembers: [{
      InvitedNumber: {
        type: Number,
        required: true,
      },
    }],
    LoanBalance: [{
      BorrowerNumber: {
        type:Number,
        required: true
      },
      LoanAmount: {
        type: Number,
        required: true,
        default: 0
      },
      LoanInterest: {
        type: Number,
        required: true,
        default: 0
      },
      Name: {
        type: String,
        required: true
      },
     
    }],
    MemberContribution: [{
     MemberPhoneNumber: {
        type:Number,
        required: true,
      },
      Contributed: {
        type: Number,
        required: true,
        default: 0
      },
      Earnings: {
        type:Number,
        required: true,
      },
      FirstName: {
        type:String,
        required: true,
      },
    }],
    circleBalance:[
      {
        _id: {
          type: String,
          required: true
        },
        Balance: {
          type: Number,
          required: true,
          default: 0,
          ref: 'Transaction'
        }
      }
    ],
    GroupMembers: [{
      MemberPhoneNumber: {
        type: Number,
        required: false,
       
      },
      Creator: {
        type: Number,
       required: false,
       
      },
      AdminNumber1: {
        type: Number,
       required: false,
        
      },
      AdminNumber2: {
        type: Number,
       required: false,
        
      },
      JoinedOn: {
        type: Date,
        default: Date.now,
      }
    }]
  });
  
const Transaction = mongoose.model('Transaction', transactionSchema);
const Wallet = mongoose.model('Wallet', walletSchema);
const User = mongoose.model('User', UserSchema);
const Savings = mongoose.model('Savings', CircleSchema);
const PersonalSavings = mongoose.model('PersonalSavings', personalsavingsSchema);
// const LoanRequest = mongoose.model('LoanRequest', loanRequestSchema);

module.exports = { Transaction, Wallet, User,Savings,PersonalSavings};
