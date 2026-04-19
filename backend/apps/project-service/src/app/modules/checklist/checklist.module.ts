import { forwardRef, Module } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../task/entities/task.entity';
import { Checklist } from './entities/checklist.entity';
import { TaskModule } from '../task/task.module';
import { TaskService } from '../task/task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checklist]),
    forwardRef(() => TaskModule),
  ],
  controllers: [ChecklistController],
  providers: [ChecklistService, TaskService],
})
export class ChecklistModule {}
