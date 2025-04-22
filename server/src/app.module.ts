import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonalityModule } from './personality/personality.module';

@Module({
  imports: [PersonalityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
