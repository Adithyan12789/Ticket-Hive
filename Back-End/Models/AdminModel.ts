import mongoose, { Document, Schema, Model } from "mongoose";

interface IAdmin extends Document {
  email: string;
  password: string;
}

const adminSchema: Schema<IAdmin> = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
