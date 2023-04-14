const mongoose = require('mongoose');
const shortid = require('shortid');


// const loanRequestSchema = new mongoose.Schema({
//   memberPhoneNumber: {
//     type: Number,
//     required: true
    
//   },
//   loanReason: {
//     type: String,
//     required: true
//   },
//   loanAmount: {
//     type: Number,
//     required: true,
//   },
//   approvalVotes: {
//     type: [String],
//     default: []
//   },
//   rejectionVotes: {
//     type: [String],
//     default: []
//   },
//   approved: {
//     type: Boolean,
//     default: false
//   },
//   rejected: {
//     type: Boolean,
//     default: false
//   }
// });

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
    GovType: {
      type: String,
      required: true,
    },
    GroupName: {
      type: String,
      required: true,
    },
    DepositGoal: {
      type: String,
      required: true,
    },
    GroupCode: {
      type: String,
      default: shortid.generate, 
    },
    Penalty: {
      type: String,
      required: true,
    },
    MultiAdmin: { 
      type: Boolean,
      required: false
    },
    VotePerson: { 
      type: Boolean,
      required: false
    },
    VoteDollar: { 
      type: Boolean,
      required: false
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    InvitedMembers: [{
      InvitedNumber: {
        type: Number,
        required: true,
        unique: true
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
    }],
    InDebtMembers: [
      {
        MemberPhoneNumber: String,
        Amount: Number,
      },
      // more objects for other members who are in debt
    ],
    circleBalance: [
      {
        MemberPhoneNumber: {
          type: Number,
          required: true
        },
        Balance: {
          type: Number,
          required: true,
          default: 0,
          validate: {
            validator: function(value) {
              return !isNaN(value);
            },
            message: 'Balance must be a number'
          },
          ref: 'Transaction'
        }
      }
    ],
    GroupMembers: [{
      MemberPhoneNumber: {
        type: Number,
        required: true,
        unique: true
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
