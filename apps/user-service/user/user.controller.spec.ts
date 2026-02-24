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
import { UserController } from './user.controller';

const mockService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
});

describe('UserController', () => {
    let service: ReturnType<typeof mockService>;
    let controller: UserController;

    beforeEach(() => {
        service = mockService();
        controller = new UserController(service as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('create', () => {

        it('delegates to service.create and returns created user', async () => {

            const dto = { username: 'juliano', email: 'juliano.ferreira@gmail.com', password: 'p' } as any;
            const created = { id: 1, ...dto };
            service.create.mockResolvedValue(created);

            await expect(controller.create(dto)).resolves.toEqual(created);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {

        it('returns list from service', async () => {

            const users = [{ id: 1 }];
            service.findAll.mockResolvedValue(users);

            await expect(controller.findAll()).resolves.toBe(users);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {

        it('returns user when found', async () => {

            const user = { id: 1 };
            service.findOne.mockResolvedValue(user);

            await expect(controller.findOne(1)).resolves.toEqual(user);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('propagates NotFoundException from service', async () => {

            service.findOne.mockRejectedValue(new NotFoundException('not found'));

            await expect(controller.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith(999);
        });
    });

    describe('update', () => {

        it('delegates to service.update and returns updated user', async () => {

            const dto = { email: 'juliano.ferreira@gmail.com' } as any;
            const updated = { id: 1, ...dto };
            service.update.mockResolvedValue(updated);

            await expect(controller.update(1, dto)).resolves.toEqual(updated);
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });

        it('propagates NotFoundException from service', async () => {

            service.update.mockRejectedValue(new NotFoundException('not found'));

            await expect(controller.update(123, { email: 'juliano.ferreira@gmail.com' } as any)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.update).toHaveBeenCalledWith(123, { email: 'juliano.ferreira@gmail.com' });
        });
    });

    describe('remove', () => {

        it('calls service.remove and returns void', async () => {

            service.remove.mockResolvedValue(undefined);

            await expect(controller.remove(1)).resolves.toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith(1);
        });

        it('propagates NotFoundException from service', async () => {

            service.remove.mockRejectedValue(new NotFoundException('not found'));

            await expect(controller.remove(999)).rejects.toBeInstanceOf(NotFoundException);
            expect(service.remove).toHaveBeenCalledWith(999);
        });
    });
});
