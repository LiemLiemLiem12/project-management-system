import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  CLD_CLOUD_NAME: process.env.CLD_CLOUD_NAME,
  CLD_API_KEY: process.env.CLD_API_KEY,
  CLD_API_SECRET: process.env.CLD_API_SECRET,
}));
