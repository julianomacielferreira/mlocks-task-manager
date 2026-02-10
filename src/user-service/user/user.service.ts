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
import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as argon2 from "argon2";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject("NOTIFICATION_SERVICE") private readonly client: ClientProxy // Inject RabbitMQ client
    ) { }

    public async create(createUserDto: CreateUserDTO): Promise<User> {

        // Check if username or email already exists
        const existingUser = await this.userRepository.findOne({
            where: [{ username: createUserDto.username }, { email: createUserDto.email }],
        });

        if (existingUser && existingUser.username === createUserDto.username) {
            throw new ConflictException('Username already taken.');
        }

        if (existingUser && existingUser.email === createUserDto.email) {
            throw new ConflictException('Email already in use.');
        }

        // Hash the password before saving
        const hashedPassword = await argon2.hash(createUserDto.password);

        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword // Store the hashed password
        });

        await this.userRepository.save(newUser);

        // Publish a 'user.created' event to RabbitMQ
        this.client.emit("user.created", { id: newUser.id, username: newUser.username, email: newUser.email });

        console.log(`User ${newUser.username} created.Emitted 'user.created' event.`);

        return newUser;
    }

    public async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<User> {

        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found.`);
        }

        return user;
    }

    public async findByUsername(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { username } });
    }

    public async update(id: number, updateUserDto: UpdateUserDTO): Promise<User> {

        const user = await this.findOne(id); // Ensure user exists

        if (!user) {
            throw new NotFoundException("User not found");
        }

        // Hash new password if provided
        if (updateUserDto.password) {
            updateUserDto.password = await argon2.hash(updateUserDto.password);
        }

        // Update user properties
        Object.assign(user, updateUserDto);

        return this.userRepository.save(user);
    }

    public async remove(id: number): Promise<void> {

        const result = await this.userRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`User with ID "${id}" not found.`);
        }
    }
}
