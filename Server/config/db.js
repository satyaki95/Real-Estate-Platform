import mongoose from "mongoose";

// Establish the database connection at startup.
// The app uses MongoDB to store users, properties, inquiries, chats, and listings.
export const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_URL}/RealState`).then(() => {
    console.log("DB CONNECTED");
  });
};
