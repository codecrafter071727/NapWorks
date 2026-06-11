import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name must be 200 characters or less"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be 0 or greater"],
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: (value: string[]) =>
          value.length >= 1 && value.length <= 4,
        message: "Product must have between 1 and 4 images",
      },
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text" });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });

const Product: Model<IProductDocument> =
  mongoose.models.Product ??
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
