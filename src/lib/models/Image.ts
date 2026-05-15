import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  userId: string;
  imageUrl: string;
  prompt: string;
  isPublic: boolean;
  likes: string[];
  remixOf?: string;
  createdAt: Date;
}

const ImageSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  prompt: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  likes: [{ type: String }],
  remixOf: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
