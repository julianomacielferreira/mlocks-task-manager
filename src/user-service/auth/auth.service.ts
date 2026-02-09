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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // For password hashing
import { CreateUserDTO } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {

        const user = await this.userService.findByUsername(username);

        if (user && await bcrypt.compare(pass, user.password)) { // Compare hashed passwords
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async login(user: any) {

        const payload = { username: user.username, sub: user.id };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    // Build the CreateUserDTO inside the method from a plain payload.
    // `UserService.create` will hash the password, so pass the raw password.
    async register(payload: { username: string; password: string; email: string; firstName: string; lastName: string; }): Promise<any> {

        const createUserDto: CreateUserDTO = {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
        };

        const newUser = await this.userService.create(createUserDto);
        return this.login(newUser);
    }
}