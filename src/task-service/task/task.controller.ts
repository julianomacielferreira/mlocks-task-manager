/*
 * The MIT License
 *
 * Copyright 2026 Juliano Maciel.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { Task } from './task.entity';

@Controller('tasks')
export class TaskController {

    constructor(private readonly taskService: TaskService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() createTaskDto: CreateTaskDTO): Promise<Task> {
        return this.taskService.create(createTaskDto);
    }

    @Get()
    public async findAll(): Promise<Task[]> {
        return this.taskService.findAll();
    }

    @Get(':id')
    public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Task> {
        return this.taskService.findOne(id);
    }

    @Get('user/:userId')
    public async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Task[]> {
        return this.taskService.findByUserId(userId);
    }

    @Get('status/:status')
    public async findByStatus(@Param('status') status: string): Promise<Task[]> {
        return this.taskService.findByStatus(status);
    }

    @Get('priority/:priority')
    public async findByPriority(@Param('priority') priority: string): Promise<Task[]> {
        return this.taskService.findByPriority(priority);
    }

    @Get('due-date/:dueDate')
    public async findByDueDate(@Param('dueDate') dueDate: string): Promise<Task[]> {
        return this.taskService.findByDueDate(dueDate);
    }

    @Get('created-by/:createdByUserId')
    public async findByCreatedByUserId(@Param('createdByUserId', ParseIntPipe) createdByUserId: number): Promise<Task[]> {
        return this.taskService.findByCreatedByUserId(createdByUserId);
    }

    @Put(':id')
    public async update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDTO): Promise<Task> {
        return this.taskService.update(id, updateTaskDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.taskService.delete(id);
    }
}