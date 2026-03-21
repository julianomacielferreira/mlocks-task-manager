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
import { TaskService } from './task.service';

type MockRepo = Partial<Record<'create' | 'save' | 'find' | 'findOne' | 'delete' | 'createQueryBuilder', jest.Mock>>;

const mockRepository = (): MockRepo => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
});

const mockClient = () => ({ emit: jest.fn() });

const makeQueryBuilderMock = (overrides: any = {}) => {

    const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(overrides.getOneResult),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(overrides.executeResult || { affected: 1 }),
    };

    return queryBuilder;
};

describe('TaskService', () => {

    let repo: MockRepo;
    let client: ReturnType<typeof mockClient>;
    let service: TaskService;
    let mockUser: any;

    beforeEach(() => {

        jest.restoreAllMocks();
        repo = mockRepository();
        client = mockClient();

        service = new TaskService(repo as any, client as any);
        mockUser = { id: 1 } as any;

    });

    afterEach(() => jest.clearAllMocks());

    describe('create', () => {

        it('creates task with dueDate converted and emits event', async () => {

            const dto = { title: 'task', dueDate: '2026-02-24', assignedToUserId: 5, createdByUserId: mockUser.id } as any;
            const created = { id: 1, title: 'task', dueDate: new Date('2026-02-24'), assignedToUserId: 5, createdByUserId: mockUser.id };

            (repo.create as jest.Mock).mockReturnValue(created);
            (repo.save as jest.Mock).mockResolvedValue(created);

            const res = await service.create(mockUser.id, dto);

            expect(repo.create).toHaveBeenCalledWith({
                ...dto,
                dueDate: new Date(dto.dueDate),
                assignedToUserId: dto.assignedToUserId,
            });

            expect(repo.save).toHaveBeenCalledWith(created);

            expect(client.emit).toHaveBeenCalledWith('task.assigned', {
                taskId: created.id,
                title: created.title,
                assignedToUserId: created.assignedToUserId,
            });

            expect(res).toEqual(created);
        });

        it('creates task with null dueDate and null assignedToUserId when absent', async () => {

            const dto = { title: 'task', createdByUserId: mockUser.id } as any;
            const created = { id: 2, title: 'task', dueDate: null, assignedToUserId: null, createdByUserId: mockUser.id };

            (repo.create as jest.Mock).mockReturnValue(created);
            (repo.save as jest.Mock).mockResolvedValue(created);

            const res = await service.create(mockUser.id, dto);

            expect(repo.create).toHaveBeenCalledWith({
                ...dto,
                dueDate: null,
                assignedToUserId: null,
            });

            expect(client.emit).toHaveBeenCalledWith('task.assigned', {
                taskId: created.id,
                title: created.title,
                assignedToUserId: created.assignedToUserId,
            });

            expect(res).toEqual(created);
        });
    });

    describe('findAll', () => {

        it('returns all tasks', async () => {

            const tasks = [{ id: 1 }, { id: 2 }];

            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findAll(mockUser.id);
            expect(res).toBe(tasks);
        });
    });

    describe('findOne', () => {

        it('returns task when found', async () => {

            const task = { id: 1, createdByUserId: mockUser.id };

            const queryBuilder = makeQueryBuilderMock({ getOneResult: task });

            (repo.createQueryBuilder as jest.Mock) = jest.fn().mockReturnValue(queryBuilder);

            await expect(service.findOne(mockUser.id, 1)).resolves.toEqual(task);

        });

        it('throws NotFoundException when not found', async () => {

            const queryBuilderNotFound = makeQueryBuilderMock({ getOneResult: undefined });

            (repo.createQueryBuilder as jest.Mock) = jest.fn().mockReturnValue(queryBuilderNotFound);

            await expect(service.findOne(mockUser.id, 999)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByUserId', () => {

        it('returns tasks assigned to user', async () => {

            const tasks = [{ id: 1, assignedToUserId: 5 }];
            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findByUserId(5);
            expect(res).toBe(tasks);
        });

        it('throws when no tasks found', async () => {

            (repo.find as jest.Mock).mockResolvedValue([]);

            await expect(service.findByUserId(42)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByStatus', () => {

        it('returns tasks for status', async () => {

            const tasks = [{ id: 1, status: 'open' }];
            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findByStatus('open');
            expect(res).toBe(tasks);
        });

        it('throws when none found', async () => {

            (repo.find as jest.Mock).mockResolvedValue([]);

            await expect(service.findByStatus('closed')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByPriority', () => {

        it('returns tasks for priority', async () => {

            const tasks = [{ id: 1, priority: 'high' }];
            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findByPriority('high');
            expect(res).toBe(tasks);
        });

        it('throws when none found', async () => {

            (repo.find as jest.Mock).mockResolvedValue([]);

            await expect(service.findByPriority('low')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByDueDate', () => {

        it('returns tasks for due date', async () => {

            const dateStr = '2026-02-24';
            const tasks = [{ id: 1, dueDate: new Date(dateStr) }];
            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findByDueDate(dateStr);
            expect(res).toBe(tasks);
        });

        it('throws when none found', async () => {

            (repo.find as jest.Mock).mockResolvedValue([]);

            await expect(service.findByDueDate('2026-01-01')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByCreatedByUserId', () => {

        it('returns tasks created by user', async () => {

            const tasks = [{ id: 1, createdByUserId: 10 }];
            (repo.find as jest.Mock).mockResolvedValue(tasks);

            const res = await service.findByCreatedByUserId(10);
            expect(res).toBe(tasks);
        });

        it('throws when none found', async () => {

            (repo.find as jest.Mock).mockResolvedValue([]);

            await expect(service.findByCreatedByUserId(99)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('update', () => {

        it('updates an existing task', async () => {

            const existingTask = { id: 1, title: 'old', assignedToUserId: 1, createdByUserId: 1 } as any;
            const dto = { title: 'new' } as any;

            const queryBuilder = makeQueryBuilderMock({ getOneResult: existingTask });
            (repo.createQueryBuilder as jest.Mock) = jest.fn().mockReturnValue(queryBuilder);

            (repo.save as jest.Mock) = jest.fn().mockResolvedValue({ ...existingTask, ...dto });

            const res = await service.update(mockUser.id, existingTask.id, dto);
            expect(res.title).toBe(dto.title);

            expect(repo.createQueryBuilder).toHaveBeenCalledWith('task');
            expect(queryBuilder.where).toHaveBeenCalledWith('task.id = :id', { id: existingTask.id });
        });

        it('throws when task not found (findOne returns undefined)', async () => {

            (repo.findOne as jest.Mock).mockResolvedValue(undefined);

            await expect(service.update(mockUser.id, 123, { title: 'x' } as any)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('delete', () => {

        it('deletes when affected > 0', async () => {

            const queryBuilderDelete = makeQueryBuilderMock({ executeResult: { affected: 1 } });

            (repo.createQueryBuilder as jest.Mock) = jest.fn().mockReturnValue(queryBuilderDelete);

            await expect(service.delete(mockUser.id, 1)).resolves.toBeUndefined();
        });

        it('throws NotFoundException when affected === 0', async () => {

            const queryBuilderDeleteZero = makeQueryBuilderMock({ executeResult: { affected: 0 } });

            (repo.createQueryBuilder as jest.Mock) = jest.fn().mockReturnValue(queryBuilderDeleteZero);

            (repo.findOne as jest.Mock) = jest.fn().mockResolvedValue(undefined);

            await expect(service.delete(mockUser.id, 999)).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
