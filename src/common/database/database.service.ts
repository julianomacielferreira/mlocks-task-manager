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
import { Injectable, Inject } from '@nestjs/common';
import { IDatabaseConnection, DATABASE_CONNECTION } from './database.interface';
import { EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService implements IDatabaseConnection {

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly connection: IDatabaseConnection,
    ) { }

    getDataSource() {
        return this.connection.getDataSource();
    }

    async query(query: string, params?: any[]) {
        return this.getDataSource().query(query, params);
    }

    async transaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
        return this.getDataSource().transaction(work);
    }
}

export default DatabaseService;
