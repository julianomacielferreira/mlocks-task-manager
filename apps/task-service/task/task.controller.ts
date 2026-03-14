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
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiResponse,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDTO } from './dto/create-task.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { Task } from './task.entity';
import { JwtAuthGuard } from '@app/auth';
import { CurrentUser } from '@app/auth';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {

    constructor(private readonly taskService: TaskService) { }

    @ApiOperation({ summary: 'Create a new task (for the current user)' })
    @ApiCreatedResponse({ type: Task })
    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    public async create(@CurrentUser() user: { id: number }, @Body() createTaskDto: CreateTaskDTO): Promise<Task> {
        return this.taskService.create(user.id, createTaskDto);
    }

    @ApiOperation({ summary: 'Retrieve all tasks (for the current user)' })
    @ApiOkResponse({ type: Task, isArray: true })
    @UseGuards(JwtAuthGuard)
    @Get()
    public async findAll(@CurrentUser() user: { id: number }): Promise<Task[]> {
        return this.taskService.findAll(user.id);
    }

    @ApiOperation({ summary: 'Retrieve a task by id (for the current user)' })
    @ApiOkResponse({ type: Task })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    public async findOne(@CurrentUser() user: { id: number }, @Param('id', ParseIntPipe) id: number): Promise<Task> {
        return this.taskService.findOne(user.id, id);
    }

    @ApiOperation({ summary: 'Retrieve tasks by user id' })
    @ApiOkResponse({ type: Task, isArray: true })
    @Get('user/:userId')
    public async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Task[]> {
        return this.taskService.findByUserId(userId);
    }

    @ApiOperation({ summary: 'Retrieve tasks by status' })
    @ApiOkResponse({ type: Task, isArray: true })
    @Get('status/:status')
    public async findByStatus(@Param('status') status: string): Promise<Task[]> {
        return this.taskService.findByStatus(status);
    }

    @ApiOperation({ summary: 'Retrieve tasks by priority' })
    @ApiOkResponse({ type: Task, isArray: true })
    @Get('priority/:priority')
    public async findByPriority(@Param('priority') priority: string): Promise<Task[]> {
        return this.taskService.findByPriority(priority);
    }

    @ApiOperation({ summary: 'Retrieve tasks by due date' })
    @ApiOkResponse({ type: Task, isArray: true })
    @Get('due-date/:dueDate')
    public async findByDueDate(@Param('dueDate') dueDate: string): Promise<Task[]> {
        return this.taskService.findByDueDate(dueDate);
    }

    @ApiOperation({ summary: 'Retrieve tasks created by a specific user' })
    @ApiOkResponse({ type: Task, isArray: true })
    @Get('created-by/:createdByUserId')
    public async findByCreatedByUserId(@Param('createdByUserId', ParseIntPipe) createdByUserId: number): Promise<Task[]> {
        return this.taskService.findByCreatedByUserId(createdByUserId);
    }

    @ApiOperation({ summary: 'Update a task' })
    @ApiOkResponse({ type: Task })
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    public async update(@CurrentUser() user: { id: number }, @Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDTO): Promise<Task> {
        return this.taskService.update(user.id, id, updateTaskDto);
    }

    @ApiOperation({ summary: 'Delete a task (soft delete for the current user)' })
    @ApiResponse({ status: 204, description: 'No content' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async remove(@CurrentUser() user: { id: number }, @Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.taskService.delete(user.id, id);
    }
}