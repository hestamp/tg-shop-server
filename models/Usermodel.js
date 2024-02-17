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
      type: String,
      default: '0',
    },
    stats: {
      totalEchos: {
        type: Number,
        default: 0,
      },
      // newEchoApprentice: {
      //   type: Boolean,
      //   default: false,
      // },
    },
    notifications: {
      basic: { type: Boolean, default: true },
      echoes: { type: Boolean, default: true },
      time: { type: String, default: null },
    },
    quotes: { type: String, default: 'true' },
    echos: { type: Array, default: [] },
    regDate: { type: String, default: '0' },
    tgid: { type: Number, default: 0 },
    lang: { type: String },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    telegramData: {
      authDate: Number,
      hash: String,
    },
    achive: {
      type: Array,
      default: [
        {
          id: 101,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 102,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 103,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 104,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 105,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 106,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 107,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 108,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
        {
          id: 109,
          current: 0,
          last: null,
          next: null,
          done: false,
          checked: false,
        },
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
