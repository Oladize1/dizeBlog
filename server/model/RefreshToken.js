import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { 
    type: String,
    unique: true, 
    required: true
   },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
   },
   ip: {
    type: String,
    required: true
   },
   lastUsedAt: {
    type: Date,
    required: true
   },
   userAgent: {
    type: String,
    required: true
   },
  expiresAt: { 
    type: Date, 
    required: true
   },
  createdAt: { 
    type: Date, 
    default: Date.now
   },
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
