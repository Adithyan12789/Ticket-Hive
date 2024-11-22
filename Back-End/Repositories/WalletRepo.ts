import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITransaction {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
}

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WalletSchema: Schema<IWallet> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    transactions: [TransactionSchema],
  },
  { timestamps: true }
);

const Wallet: Model<IWallet> = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
