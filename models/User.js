import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      required: true,
    },
    lastVisit: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
    },
    msgcount: {
      type: Number,
      default: 0,
    },
    telegramData: {
      queryId: String,
      user: {
        id: Number,
        isBot: Boolean,
        firstName: String,
        lastName: String,
        username: String,
        languageCode: String,
        isPremium: Boolean,
        addedToAttachmentMenu: Boolean,
        allowsWriteToPm: Boolean,
        photoUrl: String,
      },

      chat: {
        id: Number,
        type: String,
        title: String,
        username: String,
        photoUrl: String,
      },
      chatType: String,
      chatInstance: String,
      startParam: String,
      canSendAfter: Number,
      authDate: Number,
      hash: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', UserSchema)

// export const UserModel =
//   mongoose.models.User || mongoose.model('User', UserSchema)
