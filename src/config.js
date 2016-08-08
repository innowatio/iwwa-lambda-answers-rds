import dotenv from "dotenv";

dotenv.load();

export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_URL  = process.env.DB_URL;
export const DB_NAME = process.env.DB_NAME;
