import dotenv from "dotenv";
dotenv.config();

const config = {
  port: Number(process.env.PORT) || 8000
};

export default config;