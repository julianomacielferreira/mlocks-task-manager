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
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';

type MockRepo = Partial<{
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
}>;

const mockRepository = (): MockRepo => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
});

describe('NotificationService', () => {

    let repo: MockRepo;
    let service: NotificationService;

    beforeEach(() => {

        jest.restoreAllMocks();
        repo = mockRepository();

        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

        service = new NotificationService(repo as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('createNotification', () => {

        it('creates and returns saved notification', async () => {

            const notification = { userId: 1, type: 'info', message: 'hi' };
            const saved = { id: 1, ...notification };

            (repo.create as jest.Mock).mockReturnValue(notification);
            (repo.save as jest.Mock).mockResolvedValue(saved);

            const res = await service.createNotification(1, 'info', 'hi');

            expect(repo.create).toHaveBeenCalledWith({
                userId: 1,
                taskId: undefined,
                message: 'hi',
                type: 'info',
                isRead: false,
            });

            expect(repo.save).toHaveBeenCalledWith(notification);
            expect(res).toEqual(saved);
        });

        it('logs and rethrows when repository.save throws', async () => {

            (repo.create as jest.Mock).mockReturnValue({});
            (repo.save as jest.Mock).mockRejectedValue(new Error('db error'));

            await expect(service.createNotification(1, 'info', 'msg')).rejects.toThrow('db error');
        });
    });

    describe('getNotificationsByUserId', () => {

        it('returns notifications', async () => {

            const list = [{ id: 1 }];
            (repo.find as jest.Mock).mockResolvedValue(list);

            const res = await service.getNotificationsByUserId(1);
            expect(repo.find).toHaveBeenCalledWith({ where: { userId: 1 }, order: { createdAt: 'DESC' } });
            expect(res).toBe(list);
        });

        it('rethrows when find fails', async () => {

            (repo.find as jest.Mock).mockRejectedValue(new Error('db fail'));
            await expect(service.getNotificationsByUserId(2)).rejects.toThrow('db fail');
        });
    });

    describe('getUnreadNotifications', () => {

        it('returns unread notifications', async () => {

            const list = [{ id: 2 }];
            (repo.find as jest.Mock).mockResolvedValue(list);

            const res = await service.getUnreadNotifications(3);
            expect(repo.find).toHaveBeenCalledWith({ where: { userId: 3, isRead: false }, order: { createdAt: 'DESC' } });
            expect(res).toBe(list);
        });

        it('rethrows when find fails', async () => {

            (repo.find as jest.Mock).mockRejectedValue(new Error('fail'));
            await expect(service.getUnreadNotifications(4)).rejects.toThrow('fail');
        });
    });

    describe('markAsRead', () => {

        it('returns null when notification not found', async () => {
            (repo.findOne as jest.Mock).mockResolvedValue(undefined);
            const res = await service.markAsRead(99);
            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
            expect(res).toBeNull();
        });

        it('marks notification as read and returns updated', async () => {

            const notif = { id: 5, isRead: false } as any;
            (repo.findOne as jest.Mock).mockResolvedValue(notif);
            (repo.save as jest.Mock).mockResolvedValue({ ...notif, isRead: true });

            const res = await service.markAsRead(5);
            expect(repo.save).toHaveBeenCalledWith({ ...notif, isRead: true });
            expect(res).toEqual({ ...notif, isRead: true });
        });

        it('rethrows when findOne throws', async () => {

            (repo.findOne as jest.Mock).mockRejectedValue(new Error('boom'));
            await expect(service.markAsRead(1)).rejects.toThrow('boom');
        });
    });

    describe('markAllAsRead', () => {

        it('returns number of affected rows', async () => {

            (repo.update as jest.Mock).mockResolvedValue({ affected: 3 });
            const res = await service.markAllAsRead(7);
            expect(repo.update).toHaveBeenCalledWith({ userId: 7, isRead: false }, { isRead: true });
            expect(res).toBe(3);
        });

        it('rethrows when update fails', async () => {

            (repo.update as jest.Mock).mockRejectedValue(new Error('uerr'));
            await expect(service.markAllAsRead(8)).rejects.toThrow('uerr');
        });
    });

    describe('deleteNotification', () => {

        it('returns false when none affected', async () => {

            (repo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
            const res = await service.deleteNotification(11);
            expect(res).toBe(false);
        });

        it('returns true when deleted', async () => {

            (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
            const res = await service.deleteNotification(12);
            expect(res).toBe(true);
        });

        it('rethrows when delete fails', async () => {

            (repo.delete as jest.Mock).mockRejectedValue(new Error('delErr'));
            await expect(service.deleteNotification(13)).rejects.toThrow('delErr');
        });
    });

    describe('deleteUserNotifications', () => {

        it('returns number of deleted notifications', async () => {

            (repo.delete as jest.Mock).mockResolvedValue({ affected: 4 });
            const res = await service.deleteUserNotifications(20);
            expect(repo.delete).toHaveBeenCalledWith({ userId: 20 });
            expect(res).toBe(4);
        });

        it('rethrows when delete fails', async () => {

            (repo.delete as jest.Mock).mockRejectedValue(new Error('err'));
            await expect(service.deleteUserNotifications(21)).rejects.toThrow('err');
        });
    });

    describe('getUnreadCount', () => {

        it('returns count from repository', async () => {

            (repo.count as jest.Mock).mockResolvedValue(5);
            const res = await service.getUnreadCount(9);
            expect(repo.count).toHaveBeenCalledWith({ where: { userId: 9, isRead: false } });
            expect(res).toBe(5);
        });

        it('rethrows when count fails', async () => {

            (repo.count as jest.Mock).mockRejectedValue(new Error('cntErr'));
            await expect(service.getUnreadCount(10)).rejects.toThrow('cntErr');
        });
    });
});
