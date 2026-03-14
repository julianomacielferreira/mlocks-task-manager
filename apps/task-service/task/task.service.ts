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
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Task } from "./task.entity";
import { CreateTaskDTO } from "./dto/create-task.dto";
import { UpdateTaskDTO } from "./dto/update-task.dto";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class TaskService {

    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject("NOTIFICATION_SERVICE") private readonly client: ClientProxy
    ) { }

    public async create(userId: number, createTaskDTO: CreateTaskDTO): Promise<Task> {

        const newTask = this.taskRepository.create({
            ...createTaskDTO,
            dueDate: createTaskDTO.dueDate ? new Date(createTaskDTO.dueDate) : null,
            assignedToUserId: createTaskDTO.assignedToUserId ?? null,
            createdByUserId: userId
        });

        await this.taskRepository.save(newTask);

        this.client.emit(
            'task.assigned',
            {
                taskId: newTask.id,
                title: newTask.title,
                assignedToUserId: newTask.assignedToUserId
            }
        );

        return newTask;
    }

    public async findAll(userId: number): Promise<Task[]> {

        return await this.taskRepository.find(
            {
                where: [
                    { assignedToUserId: userId },
                    { createdByUserId: userId }
                ],
                order: {
                    createdAt: 'DESC'
                }
            }
        );
    }

    public async findOne(userId: number, id: number): Promise<Task> {

        const queryBuilder = this.taskRepository.createQueryBuilder('task');

        const task = await queryBuilder
            .where('task.id = :id', { id })
            .andWhere(new Brackets(queryBuilderInner =>
                queryBuilderInner
                    .where('task.assigned_to_user_id = :userId', { userId })
                    .orWhere('task.created_by_user_id = :userId', { userId })
            ))
            .getOne();

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found.`);
        }

        return task;
    }

    public async findByUserId(userId: number): Promise<Task[]> {

        const tasks = await this.taskRepository.find({ where: { assignedToUserId: userId } });

        this.throwNotFoundException(tasks, `No tasks found for user with ID ${userId}.`);

        return tasks;
    }

    public async findByStatus(status: string): Promise<Task[]> {

        const tasks = await this.taskRepository.find({ where: { status: status as any } });

        this.throwNotFoundException(tasks, `No tasks found with status "${status}".`);

        return tasks;
    }

    public async findByPriority(priority: string): Promise<Task[]> {

        const tasks = await this.taskRepository.find({ where: { priority: priority as any } });

        this.throwNotFoundException(tasks, `No tasks found with priority "${priority}".`);

        return tasks;
    }

    public async findByDueDate(dueDate: string): Promise<Task[]> {

        const date = new Date(dueDate);
        const tasks = await this.taskRepository.find({ where: { dueDate: date } });

        this.throwNotFoundException(tasks, `No tasks found with due date "${dueDate}".`);

        return tasks;
    }

    public async findByCreatedByUserId(createdByUserId: number): Promise<Task[]> {

        const tasks = await this.taskRepository.find({ where: { createdByUserId } });

        this.throwNotFoundException(tasks, `No tasks found created by user with ID ${createdByUserId}.`);

        return tasks;
    }

    public async update(userId: number, id: number, updateTaskDTO: UpdateTaskDTO): Promise<Task> {

        const task = await this.findOne(userId, id);

        if (!task) {
            throw new NotFoundException("Task not found");
        }

        Object.assign(task, updateTaskDTO);

        return this.taskRepository.save(task);
    }

    public async delete(userId: number, id: number): Promise<void> {

        const result = await this.taskRepository.createQueryBuilder()
            .update(Task)
            .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
            .where("id = :id", { id })
            .andWhere(new Brackets(queryBuilder => {
                queryBuilder.where("assigned_to_user_id = :userId", { userId })
                    .orWhere("created_by_user_id = :userId", { userId });
            }))
            .execute();

        if (result.affected === 1)
            return;

        const exists = await this.taskRepository.findOne({ where: { id }, withDeleted: true });

        if (!exists) {
            throw new NotFoundException(`Task with ID ${id} not found.`);
        }

        throw new ForbiddenException(`Not allowed to delete this task.`);
    }

    private throwNotFoundException(tasks: Task[], message: string) {

        if (!tasks || tasks.length === 0) {
            throw new NotFoundException(message);
        }
    }
}