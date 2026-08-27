import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";

const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      require: true,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      require: true,
    },

    memberPassword: {
      type: String,
      select: false,
      require: true,
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoint: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }, // updatedAt, createdAt
);

export default mongoose.model("Member", memberSchema);
