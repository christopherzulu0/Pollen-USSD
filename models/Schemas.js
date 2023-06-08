const mongoose = require('mongoose');
const shortid = require('shortid');
const cron = require('node-cron');





// Define the Session schema
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

// Create the Session model
const Session = mongoose.model('Session', sessionSchema);

// Function to retrieve the active session for a phone number
async function getSession(phoneNumber) {
  const session = await Session.findOne({ phoneNumber });
  return session;
}

// Function to create or update a session for a phone number
async function createOrUpdateSession(sessionId, phoneNumber) {
  const session = await Session.findOneAndUpdate(
    { phoneNumber },
    { sessionId, lastAccessed: Date.now() },
    { upsert: true, new: true }
  );
  return session;
}

// Middleware to update the session for each request
async function updateSession(req, res, next) {
  const { sessionId, phoneNumber } = req.body;
  if (sessionId && phoneNumber) {
    await createOrUpdateSession(sessionId, phoneNumber);
  }
  next();
}

// Schedule the task to update session last accessed time
cron.schedule('*/10 * * * *', async () => {
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - 10);
  await Session.deleteMany({ lastAccessed: { $lt: cutoffTime } });
});





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
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false,
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
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false,
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
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false,
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
     session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: false,
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
    createdDate:{
      type:Date,
      default:null
    },
    closingDate:{
      type:Date,
      default:null
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: false,
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
      ProposedMonths:{
        type:Number,
        required:true
      },
     Name: {
        type: String,
        required: true
      },
      LoanAmount: {
        type: Number,
        required: true,
        default: 0
      },
      ApprovalVotes: {
        type: [Number],
        default: []
      },
      RejectionVotes: {
        type: [Number],
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
      totalLoan:{
        type: Number,
        required: true,
        default:0
      },
      Name: {
        type: String,
        required: true
      },
      Status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Pending Admin Approval'],
        default: 'Pending'
      },
      disbursedDate: {
        type: Date,
        default: null
      },
      dueDate: {
        type: Date,
        default: null
      },
      daysRemaining :{
        type: Number,
        default: null
      }
     
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
    MemberStats:[{
    Amount: {
            type: Number,
            default: 0
          },
   Date: {
            type: String,
            default: Date.now
          },
      PaidLoans:{
        type: Number,
        default:0
      },
      GoalsMet:{
        type: Number,
        default:0
      },
      MemberPhoneNumber:{
        type:Number,
        required:true
      },
      Name:{
        type: String,
        required: true
      },
      LatePayments:{
        type:Number,
        default:0
      }
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
        },
        LoanInterest: {
          type: Number,
          required: false,
          default: 0
        },
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

module.exports = { 
  Transaction,
  Wallet,
  User,
  Savings,
  PersonalSavings,
  Session,
  updateSession,
  getSession,
};
