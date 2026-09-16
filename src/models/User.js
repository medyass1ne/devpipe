import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  githubId: { type: String, required: true, unique: true },
  githubUsername: { type: String },
  githubAccessToken: { type: String },
  tokens: {
    devtoKey: { type: String, default: null },
    hashnodeKey: { type: String, default: null },
    redditConnected: { type: Boolean, default: false },
    redditUsername: { type: String, default: null },
    redditAccessToken: { type: String, default: null },
    redditRefreshToken: { type: String, default: null },
  }
}, { timestamps: true });

delete mongoose.models.User;
export default mongoose.model('User', UserSchema);
