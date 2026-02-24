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
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from './database.interface';

export const PG_POOL = 'PG_POOL';

export const dataSourceProvider = {
    provide: DATABASE_CONNECTION,
    useFactory: async (config: ConfigService) => {
        const ds = new DataSource({
            type: 'postgres',
            host: config.get('DATABASE_HOST'),
            port: +config.get('DATABASE_PORT'),
            username: config.get('DATABASE_USER'),
            password: config.get('DATABASE_PASSWORD'),
            database: config.get('DATABASE_NAME'),
            entities: [path.join(__dirname, '..', '..', 'apps', '**', '*.entity{.ts,.js}')],
            synchronize: false,
        });
        await ds.initialize();
        return {
            getDataSource: () => ds,
        };
    },
    inject: [ConfigService],
};

export const pgPoolProvider = {
    provide: PG_POOL,
    useFactory: (config: ConfigService) => {
        return new Pool({
            host: config.get('DATABASE_HOST'),
            port: +config.get('DATABASE_PORT'),
            user: config.get('DATABASE_USER'),
            password: config.get('DATABASE_PASSWORD'),
            database: config.get('DATABASE_NAME'),
        });
    },
    inject: [ConfigService],
};

export const databaseProviders = [dataSourceProvider, pgPoolProvider];
