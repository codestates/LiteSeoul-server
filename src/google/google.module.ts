import { HttpModule, Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: '1d' },
    }),
    HttpModule
  ],
  providers: [GoogleService, GoogleStrategy],
  controllers: [GoogleController]
})
export class GoogleModule {}
