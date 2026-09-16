import mongoose from 'mongoose';

const PlatformStateSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'published', 'failed'], default: 'pending' },
  error: { type: String, default: null },
  url: { type: String, default: null }
}, { _id: false });

const ReleaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  version: { type: String, required: true },
  masterContent: { type: String, required: true },
  transformedContent: {
    github: { type: String, default: null },
    devto: { type: String, default: null },
    hashnode: { type: String, default: null },
    reddit: { type: String, default: null }
  },
  publishStates: {
    github: { type: PlatformStateSchema, default: () => ({}) },
    devto: { type: PlatformStateSchema, default: () => ({}) },
    hashnode: { type: PlatformStateSchema, default: () => ({}) },
    reddit: { type: PlatformStateSchema, default: () => ({}) }
  },
  status: { type: String, enum: ['draft', 'transformed', 'published'], default: 'draft' }
}, { timestamps: true });

// Delete the cached model to ensure hot-reloads apply the new schema
delete mongoose.models.Release;
export default mongoose.model('Release', ReleaseSchema);
