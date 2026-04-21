import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LabelService } from '../services/label.service';
import { CreateLabelDto } from '../dto/create-label.dto';
import { UpdateLabelDto } from '../dto/update-label.dto';

@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  createLabel(@Body() body: CreateLabelDto) {
    return this.labelService.createLabel(body);
  }

  @Get('project/:projectId')
  getLabelsByProject(@Param('projectId') projectId: string) {
    return this.labelService.getLabelsByProject(projectId);
  }

  @Patch(':id')
  updateLabel(@Param('id') id: string, @Body() body: UpdateLabelDto) {
    return this.labelService.updateLabel(id, body);
  }

  @Delete(':id')
  deleteLabel(@Param('id') id: string) {
    return this.labelService.deleteLabel(id);
  }
}
