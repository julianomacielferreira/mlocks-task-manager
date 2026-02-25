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
import { Logger } from '@nestjs/common';
import { NotificationController } from './notification.controller';

const mockService = () => ({
    createNotification: jest.fn(),
});

const mockMailService = () => ({
    sendWelcomeEmail: jest.fn(),
    sendTaskAssignedEmail: jest.fn(),
});

const mockUserRepo = () => ({
    findOne: jest.fn(),
});

describe('NotificationController', () => {

    let service: ReturnType<typeof mockService>;
    let mailService: ReturnType<typeof mockMailService>;
    let userRepo: ReturnType<typeof mockUserRepo>;
    let controller: NotificationController;

    beforeEach(() => {
        jest.restoreAllMocks();
        service = mockService();
        mailService = mockMailService();
        userRepo = mockUserRepo();

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

        controller = new NotificationController(service as any, mailService as any, userRepo as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('handleUserCreated', () => {

        it('calls sendWelcomeEmail and createNotification on success', async () => {

            (mailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);
            service.createNotification.mockResolvedValue({ id: 1 });

            const data = { id: 1, email: 'ju.maciel.ferreira@gmail.com', username: 'juliano' };

            await expect(controller.handleUserCreated(data)).resolves.toBeUndefined();

            expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith('ju.maciel.ferreira@gmail.com', 'juliano');
            expect(service.createNotification).toHaveBeenCalledWith(1, 'welcome', `Welcome, juliano!`);
        });

        it('propagates error from sendWelcomeEmail and does not call createNotification', async () => {

            (mailService.sendWelcomeEmail as jest.Mock).mockRejectedValue(new Error('smtp fail'));

            const data = { id: 2, email: 'ju.maciel.ferreira@gmail.com', username: 'juliano' };

            await expect(controller.handleUserCreated(data)).rejects.toThrow('smtp fail');
            expect(service.createNotification).not.toHaveBeenCalled();
        });
    });

    describe('handleTaskAssigned', () => {

        it('calls createNotification with task assignment data', async () => {

            service.createNotification.mockResolvedValue({ id: 10 });
            (userRepo.findOne as jest.Mock).mockResolvedValue(undefined);

            const data = { taskId: 5, assignedToUserId: 7, title: 'Do Task X' } as any;

            await expect(controller.handleTaskAssigned(data)).resolves.toBeUndefined();

            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
            expect(service.createNotification).toHaveBeenCalledWith(7, 'task_assigned', `Task \"${data.title}\" assigned to you.`);
        });

        it('sends task assigned email when assignee email present and creates notification', async () => {

            service.createNotification.mockResolvedValue({ id: 12 });
            (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 9, email: 'assignee@example.com' });
            (mailService.sendTaskAssignedEmail as jest.Mock).mockResolvedValue(undefined);

            const data = { taskId: 8, assignedToUserId: 9, title: 'Do Important' } as any;

            await expect(controller.handleTaskAssigned(data)).resolves.toBeUndefined();

            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 9 } });
            expect(mailService.sendTaskAssignedEmail).toHaveBeenCalledWith('assignee@example.com', data.title);
            expect(service.createNotification).toHaveBeenCalledWith(9, 'task_assigned', `Task \"${data.title}\" assigned to you.`);
        });

        it('propagates error from mailService and does not call createNotification when email send fails', async () => {

            (userRepo.findOne as jest.Mock).mockResolvedValue({ id: 11, email: 'bad@example.com' });
            (mailService.sendTaskAssignedEmail as jest.Mock).mockRejectedValue(new Error('smtp fail'));

            const data = { taskId: 10, assignedToUserId: 11, title: 'TaskZ' } as any;

            await expect(controller.handleTaskAssigned(data)).rejects.toThrow('smtp fail');
            expect(service.createNotification).not.toHaveBeenCalled();
        });

        it('propagates error from createNotification', async () => {

            service.createNotification.mockRejectedValue(new Error('db error'));

            const data = { taskId: 6, assignedToUserId: 8, title: 'Task Y' } as any;

            await expect(controller.handleTaskAssigned(data)).rejects.toThrow('db error');
        });
    });

    describe('handleTaskUpdated', () => {

        it('creates notification about status change', async () => {

            service.createNotification.mockResolvedValue({ id: 11 });

            const data = { taskId: 9, userId: 3, title: 'TaskA', newStatus: 'done' } as any;

            await expect(controller.handleTaskUpdated(data)).resolves.toBeUndefined();

            expect(service.createNotification).toHaveBeenCalledWith(3, 'task_updated', `Task "${data.title}" status changed to ${data.newStatus}.`);
        });

        it('propagates errors from createNotification', async () => {

            service.createNotification.mockRejectedValue(new Error('fail'));

            const data = { taskId: 10, userId: 4, title: 'TaskB', newStatus: 'open' } as any;

            await expect(controller.handleTaskUpdated(data)).rejects.toThrow('fail');
        });
    });
});
