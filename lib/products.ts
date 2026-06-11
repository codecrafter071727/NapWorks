import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getProductCount(): Promise<number> {
  try {
    if (!process.env.MONGODB_URI) {
      return 0;
    }

    await connectDB();
    return Product.countDocuments();
  } catch {
    return 0;
  }
}
