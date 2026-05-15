import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  avatarUrl?: string;
  credits: number;
  plan: string;
  creditsResetAt: Date;
  planExpiresAt?: Date | null;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  credits: { type: Number, default: 15 },
  plan: { type: String, default: 'free' },
  creditsResetAt: { type: Date, default: Date.now },
  planExpiresAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
