import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const config = configService.get('cloudinary');

    return cloudinary.config({
      cloud_name: config.CLD_CLOUD_NAME,
      api_key: config.CLD_API_KEY,
      api_secret: config.CLD_API_SECRET,
    });
  },
  inject: [ConfigService],
};
