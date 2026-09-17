import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_URL}/RealState`).then(() => {
    console.log("DB CONNECTED");
  });
};
