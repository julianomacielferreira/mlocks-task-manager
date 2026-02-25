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
import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { MailService } from '../../../libs/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProjection } from './user-projection.entity';

@ApiTags('notifications')
@Controller()
export class NotificationController {

    private readonly logger = new Logger(NotificationController.name);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mailService: MailService,
        @InjectRepository(UserProjection)
        private readonly userProjectionRepo: Repository<UserProjection>,
    ) { }

    @EventPattern('user.created')
    async handleUserCreated(data: { id: number; email: string; username: string }) {

        this.logger.log(`Received user.created event for user: ${data.username}`);

        await this.mailService.sendWelcomeEmail(data.email, data.username);

        await this.userProjectionRepo.save({ id: data.id, email: data.email, username: data.username });

        await this.notificationService.createNotification(data.id, 'welcome', `Welcome, ${data.username}!`);
    }

    @EventPattern('task.assigned')
    async handleTaskAssigned(data: { taskId: number; assignedToUserId: number; title: string }) {

        this.logger.log(`Received task.assigned event for task: ${data.title}`);

        const projection = await this.userProjectionRepo.findOne({ where: { id: data.assignedToUserId } });

        const assigneeEmail = projection?.email || (data as any).email || null;

        if (assigneeEmail) {
            await this.mailService.sendTaskAssignedEmail(assigneeEmail, data.title);
        } else {
            // fallback: attempt a fast HTTP call to user-service or enqueue retry
        }

        await this.notificationService.createNotification(data.assignedToUserId, 'task_assigned', `Task "${data.title}" assigned to you.`);
    }

    @EventPattern('task.updated')
    async handleTaskUpdated(data: { taskId: number; userId: number; title: string; newStatus: string }) {

        this.logger.log(`Received task.updated event for task: ${data.title}`);

        await this.notificationService.createNotification(data.userId, 'task_updated', `Task "${data.title}" status changed to ${data.newStatus}.`);
    }
}