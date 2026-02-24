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
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let dsMock: any;
    let connectionMock: any;
    let service: DatabaseService;

    beforeEach(() => {

        dsMock = {
            query: jest.fn(),
            transaction: jest.fn(),
        };

        connectionMock = {
            getDataSource: jest.fn().mockReturnValue(dsMock),
        };

        service = new DatabaseService(connectionMock);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns the underlying data source via getDataSource', () => {

        const ds = service.getDataSource();
        expect(connectionMock.getDataSource).toHaveBeenCalled();
        expect(ds).toBe(dsMock);
    });

    it('calls query on the data source with params', async () => {

        dsMock.query.mockResolvedValue(['row']);

        const res = await service.query('SELECT 1', [1]);

        expect(connectionMock.getDataSource).toHaveBeenCalled();
        expect(dsMock.query).toHaveBeenCalledWith('SELECT 1', [1]);
        expect(res).toEqual(['row']);
    });

    it('calls query on the data source without params', async () => {

        dsMock.query.mockResolvedValue([]);

        const res = await service.query('SELECT NOW()');

        expect(dsMock.query).toHaveBeenCalledWith('SELECT NOW()', undefined);
        expect(res).toEqual([]);
    });

    it('propagates errors from query', async () => {

        dsMock.query.mockRejectedValue(new Error('bad query'));

        await expect(service.query('bad')).rejects.toThrow('bad query');
    });

    it('runs a transaction and returns its result', async () => {

        dsMock.transaction.mockImplementation(async (work: any) => work({ manager: true }));

        const result = await service.transaction(async (manager: any) => {
            return 'ok-' + (manager.manager ? 'yes' : 'no');
        });

        expect(dsMock.transaction).toHaveBeenCalled();
        expect(result).toBe('ok-yes');
    });

    it('propagates errors from transaction', async () => {

        dsMock.transaction.mockRejectedValue(new Error('tx fail'));

        await expect(service.transaction(async () => 1)).rejects.toThrow('tx fail');
    });
});
