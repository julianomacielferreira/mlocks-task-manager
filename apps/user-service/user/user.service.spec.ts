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
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserService } from './user.service';

type MockRepo = Partial<Record<'findOne' | 'create' | 'save' | 'find' | 'delete', jest.Mock>>;

const mockRepository = (): MockRepo => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
});

const mockClient = () => ({ emit: jest.fn() });

const mockRoleRepository = () => ({ findOne: jest.fn() });

describe('UserService', () => {

    let repo: MockRepo;
    let roleRepo: ReturnType<typeof mockRoleRepository>;
    let client: ReturnType<typeof mockClient>;
    let service: UserService;

    beforeEach(() => {
        jest.restoreAllMocks();
        repo = mockRepository();
        roleRepo = mockRoleRepository();
        client = mockClient();

        jest.spyOn(argon2, 'hash').mockImplementation(async (v: string) => `hashed-${v}`);

        service = new UserService(repo as any, roleRepo as any, client as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('create', () => {

        it('throws when username already taken', async () => {

            (repo.findOne as jest.Mock).mockResolvedValueOnce({ username: 'juliano', email: 'ju.maciel.ferreira@gmail.com' });

            await expect(
                service.create({ username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'pw' } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('throws when email already in use', async () => {

            (repo.findOne as jest.Mock).mockResolvedValueOnce({ username: 'juliano', email: 'ju.maciel.ferreira@gmail.com' });

            await expect(
                service.create({ username: 'maciel', email: 'ju.maciel.ferreira@gmail.com', password: 'pw' } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('creates user, hashes password, saves and emits event', async () => {

            (repo.findOne as jest.Mock).mockResolvedValueOnce(undefined);

            const dto = { username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'plain' } as any;

            const created = { id: 1, username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'hashed-plain' };

            (repo.create as jest.Mock).mockReturnValue(created);
            (repo.save as jest.Mock).mockResolvedValue(created);

            const result = await service.create(dto);

            expect(argon2.hash).toHaveBeenCalledWith('plain');
            expect(repo.create).toHaveBeenCalledWith({ ...dto, password: 'hashed-plain' });
            expect(repo.save).toHaveBeenCalledWith(created);
            expect(client.emit).toHaveBeenCalledWith('user.created', { id: created.id, username: created.username, email: created.email });
            expect(result).toEqual(created);
        });
    });

    describe('findAll', () => {

        it('returns all users', async () => {

            const users = [{ id: 1 }, { id: 2 }];
            (repo.find as jest.Mock).mockResolvedValue(users);

            const result = await service.findAll();
            expect(result).toBe(users);
        });
    });

    describe('findOne', () => {

        it('returns user when found', async () => {

            const user = { id: 1 };
            (repo.findOne as jest.Mock).mockResolvedValue(user);

            await expect(service.findOne(1)).resolves.toEqual(user);
        });

        it('throws NotFoundException when not found', async () => {

            (repo.findOne as jest.Mock).mockResolvedValue(undefined);

            await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('findByUsername', () => {

        it('returns user or undefined', async () => {

            const user = { id: 1, username: 'juliano' };
            (repo.findOne as jest.Mock).mockResolvedValue(user);

            const res = await service.findByUsername('juliano');
            expect(res).toEqual(user);
        });
    });

    describe('update', () => {

        it('updates user without changing password', async () => {

            const existing = { id: 1, username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'old' };
            (repo.findOne as jest.Mock).mockImplementation(async (opts: any) => {
                if (opts && opts.where && opts.where.id === 1) return existing;
                return undefined;
            });

            const dto = { email: 'new@e.com' } as any;
            const saved = { ...existing, ...dto };
            (repo.save as jest.Mock).mockResolvedValue(saved);

            const res = await service.update(1, dto);
            expect(repo.save).toHaveBeenCalledWith(saved);
            expect(res).toEqual(saved);
        });

        it('hashes password when present in update dto', async () => {

            const existing = { id: 1, username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'old' };
            (repo.findOne as jest.Mock).mockImplementation(async (opts: any) => {
                if (opts && opts.where && opts.where.id === 1) return existing;
                return undefined;
            });

            const dto = { password: 'newpw' } as any;
            const saved = { ...existing, password: 'hashed-newpw' };
            (repo.save as jest.Mock).mockResolvedValue(saved);

            const res = await service.update(1, dto);

            expect(argon2.hash).toHaveBeenCalledWith('newpw');
            expect(repo.save).toHaveBeenCalledWith(saved);
            expect(res).toEqual(saved);
        });

        it('throws when user not found', async () => {

            (repo.findOne as jest.Mock).mockResolvedValue(undefined);

            await expect(service.update(123, { email: 'juliano.ferreira@gmail.com' } as any)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('remove', () => {

        it('removes user when affected > 0', async () => {

            (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

            await expect(service.remove(1)).resolves.toBeUndefined();
        });

        it('throws NotFoundException when no rows affected', async () => {

            (repo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

            await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
