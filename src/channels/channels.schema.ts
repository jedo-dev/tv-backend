import { Document, Schema } from 'mongoose';

export const ChannelsSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

export interface Channels extends Document {
  id: number;
  name: string;
  icon: string;
}
