import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    authId: {
      type: Number,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    goal: { type: String, default: '' },
    fullName: {
      type: String,
    },
    lastAppOpen: {
      type: Number,
      default: 0,
    },
    echos: { type: Array, default: [] },
    regDate: { type: Number, default: 0 },
    tgid: { type: Number, default: 0 },
    lang: { type: String },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    telegramData: {
      authDate: Number,
      hash: String,
    },
    nickname: { type: String },
    achive: {
      type: Array,
      default: [
        { id: 101, current: 0, last: null, next: null, done: false },
        { id: 102, current: 0, last: null, next: null, done: false },
        { id: 103, current: 0, last: null, next: null, done: false },
        { id: 104, current: 0, last: null, next: null, done: false },
        { id: 105, current: 0, last: null, next: null, done: false },
        { id: 106, current: 0, last: null, next: null, done: false },
        { id: 107, current: 0, last: null, next: null, done: false },
        { id: 108, current: 0, last: null, next: null, done: false },
        { id: 109, current: 0, last: null, next: null, done: false },
      ],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', UserSchema)

// export const UserModel =
//   mongoose.models.User || mongoose.model('User', UserSchema)
