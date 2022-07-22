import * as dotenv from "dotenv";

dotenv.config();

interface ProcessEnv {
  PORT: number;
}

const app: ProcessEnv = {
  PORT: Number(process.env.PORT) || 9999,
};

export default app;
