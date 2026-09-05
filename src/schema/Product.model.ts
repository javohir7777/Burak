import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
  ProductVolume,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },
    productCollection: {
      type: String,
      enum: ProductCollection,
      require: true,
    },
    productName: {
      type: String,
      require: true,
    },
    productPrice: {
      type: Number,
      require: true,
    },
    productLeftCount: {
      type: Number,
      require: true,
    },
    productSize: {
      type: String,
      enum: ProductSize,
      default: ProductSize.NORMAL,
    },
    productVolume: {
      type: String,
      enum: ProductVolume,
      default: ProductVolume.ONE,
    },
    productDesc: {
      type: Number,
      require: true,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViwes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }, // updatedAt, createdAt
);

productSchema.index(
  { productName: 1, productSize: 1, productVolume: 1 },
  { unique: true },
);

export default mongoose.model("Product", productSchema);
