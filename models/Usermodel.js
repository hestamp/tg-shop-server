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
      learnedTimes: {
        type: Number,
        default: 0,
      },
      completedEchoes: {
        type: Number,
        default: 0,
      },
      repetitionEchoes: {
        type: Object,
        default: {
          count: {
            type: Number,
            default: 0,
          },
          last: { type: String, default: null },
        },
      },
    },
    notifications: {
      basic: { type: Boolean, default: true },
      echoes: { type: Boolean, default: true },
      empty: { type: Boolean, default: false },
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
          done: false,
          checked: false,
        },
        {
          id: 102,
          done: false,
          checked: false,
        },
        {
          id: 103,
          done: false,
          checked: false,
        },
        {
          id: 104,
          done: false,
          checked: false,
        },
        {
          id: 105,
          done: false,
          checked: false,
        },
        {
          id: 106,
          done: false,
          checked: false,
        },
        {
          id: 107,
          done: false,
          checked: false,
        },
        {
          id: 108,
          checked: false,
        },
        {
          id: 109,
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
