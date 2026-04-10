import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberTalent } from './entities/member-talent.entity';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberTalent, Project, ProjectMember]),
    forwardRef(() => TaskModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
