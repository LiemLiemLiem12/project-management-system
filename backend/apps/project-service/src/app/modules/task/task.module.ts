import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTask } from './entities/group-task.entity';
import { Task } from './entities/task.entity';
import { Label } from './entities/label.entity';
import { ProjectModule } from '../project/project.module';
import { Checklist } from './entities/checklist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupTask, Task, Label, Checklist]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
