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
import { NotFoundException } from '@nestjs/common';
import { TaskController } from './task.controller';

const mockService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findByStatus: jest.fn(),
    findByPriority: jest.fn(),
    findByDueDate: jest.fn(),
    findByCreatedByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

describe('TaskController', () => {

    let service: ReturnType<typeof mockService>;
    let controller: TaskController;

    beforeEach(() => {

        service = mockService();
        controller = new TaskController(service as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('create', () => {

        it('delegates to service.create and returns created task', async () => {

            const dto = { title: 'task', dueDate: '2026-02-24' } as any;
            const created = { id: 1, title: 'task' } as any;
            service.create.mockResolvedValue(created);

            await expect(controller.create(dto)).resolves.toEqual(created);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {

        it('returns tasks from service', async () => {

            const tasks = [{ id: 1 }];
            service.findAll.mockResolvedValue(tasks);

            await expect(controller.findAll()).resolves.toBe(tasks);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {

        it('returns task when found', async () => {

            const task = { id: 1 };
            service.findOne.mockResolvedValue(task);

            await expect(controller.findOne(1)).resolves.toEqual(task);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('propagates NotFoundException from service', async () => {

            service.findOne.mockRejectedValue(new NotFoundException('not found'));

            await expect(controller.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith(999);
        });
    });

    describe('findByUserId', () => {

        it('returns tasks for user', async () => {

            const tasks = [{ id: 1 }];
            service.findByUserId.mockResolvedValue(tasks);

            await expect(controller.findByUserId(5)).resolves.toBe(tasks);
            expect(service.findByUserId).toHaveBeenCalledWith(5);
        });

        it('propagates NotFoundException', async () => {

            service.findByUserId.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.findByUserId(42)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findByUserId).toHaveBeenCalledWith(42);
        });
    });

    describe('findByStatus', () => {

        it('returns tasks for status', async () => {

            const tasks = [{ id: 1 }];
            service.findByStatus.mockResolvedValue(tasks);

            await expect(controller.findByStatus('open')).resolves.toBe(tasks);
            expect(service.findByStatus).toHaveBeenCalledWith('open');
        });

        it('propagates NotFoundException', async () => {

            service.findByStatus.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.findByStatus('closed')).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findByStatus).toHaveBeenCalledWith('closed');
        });
    });

    describe('findByPriority', () => {

        it('returns tasks for priority', async () => {

            const tasks = [{ id: 1 }];
            service.findByPriority.mockResolvedValue(tasks);

            await expect(controller.findByPriority('high')).resolves.toBe(tasks);
            expect(service.findByPriority).toHaveBeenCalledWith('high');
        });

        it('propagates NotFoundException', async () => {

            service.findByPriority.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.findByPriority('low')).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findByPriority).toHaveBeenCalledWith('low');
        });
    });

    describe('findByDueDate', () => {

        it('returns tasks for due date', async () => {

            const tasks = [{ id: 1 }];
            service.findByDueDate.mockResolvedValue(tasks);

            await expect(controller.findByDueDate('2026-02-24')).resolves.toBe(tasks);
            expect(service.findByDueDate).toHaveBeenCalledWith('2026-02-24');
        });

        it('propagates NotFoundException', async () => {

            service.findByDueDate.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.findByDueDate('2026-01-01')).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findByDueDate).toHaveBeenCalledWith('2026-01-01');
        });
    });

    describe('findByCreatedByUserId', () => {

        it('returns tasks for creator', async () => {

            const tasks = [{ id: 1 }];
            service.findByCreatedByUserId.mockResolvedValue(tasks);

            await expect(controller.findByCreatedByUserId(10)).resolves.toBe(tasks);
            expect(service.findByCreatedByUserId).toHaveBeenCalledWith(10);
        });

        it('propagates NotFoundException', async () => {

            service.findByCreatedByUserId.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.findByCreatedByUserId(99)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findByCreatedByUserId).toHaveBeenCalledWith(99);
        });
    });

    describe('update', () => {

        it('delegates to service.update and returns updated task', async () => {

            const dto = { title: 'task' } as any;
            const updated = { id: 1, ...dto } as any;
            service.update.mockResolvedValue(updated);

            await expect(controller.update(1, dto)).resolves.toEqual(updated);
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });

        it('propagates NotFoundException', async () => {

            service.update.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.update(123, {} as any)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.update).toHaveBeenCalledWith(123, {});
        });
    });

    describe('remove', () => {

        it('delegates to service.delete and returns void', async () => {

            service.delete.mockResolvedValue(undefined);

            await expect(controller.remove(1)).resolves.toBeUndefined();
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('propagates NotFoundException', async () => {

            service.delete.mockRejectedValue(new NotFoundException('none'));

            await expect(controller.remove(999)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.delete).toHaveBeenCalledWith(999);
        });
    });
});
