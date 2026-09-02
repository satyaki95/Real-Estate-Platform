import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://wwwsatyaki95_db_user:8VXxohSbSn8PyPTz@cluster0.3cl54wx.mongodb.net/RealState",
    )
    .then(() => {
      console.log("DB CONNECTED");
    });
};
