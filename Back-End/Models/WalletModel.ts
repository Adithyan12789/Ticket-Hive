import mongoose, { Document, Model, Schema } from 'mongoose';

// Transaction interface for the wallet
export interface ITransaction {
  transactionId: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'success' | 'failed';
  date: Date;
  description: string;
}

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId; // Reference to the user
  balance: number; // Current wallet balance
  transactions: ITransaction[]; // Array of transactions
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema<IWallet> = new Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', // Assuming you have a 'User' model to reference
      required: true 
    },
    balance: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    transactions: [
      {
        transactionId: { type: String, required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        status: { type: String, enum: ['success', 'failed'], required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, required: true }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

// Update the updatedAt field on save
WalletSchema.pre<IWallet>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Wallet: Model<IWallet> = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
