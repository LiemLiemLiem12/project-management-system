import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTask } from './entities/group-task.entity';
import { Task } from './entities/task.entity';
import { Label } from './entities/label.entity';
import { ProjectModule } from '../project/project.module';
import { ChecklistModule } from '../checklist/checklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupTask, Task, Label]),
    forwardRef(() => ProjectModule),
    forwardRef(() => ChecklistModule),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService, TypeOrmModule],
})
export class TaskModule {}
