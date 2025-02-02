import { Document, Schema } from 'mongoose';

export const TvProgrammsSchema = new Schema({
  start: { type: Date, required: true },
  stop: { type: Date, required: true },
  channel: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  lang: { type: String },
});

export interface TvProgramms extends Document {
  start: Date;
  stop: Date;
  channel: number;
  title: string;
  description?: string;
  category?: string;
  lang?: string;
}
