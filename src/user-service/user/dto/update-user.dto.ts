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
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import {
    IsOptional,
    IsString,
    MinLength,
    IsEmail
} from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {

    @IsString()
    @IsOptional()
    @MinLength(3, { message: 'Username must be at least 3 characters long.' })
    username?: string;

    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password?: string;
}