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
import { Role, RoleType } from './role.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as argon2 from "argon2";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @Inject("NOTIFICATION_SERVICE") private readonly client: ClientProxy
    ) { }

    public async create(createUserDto: CreateUserDTO): Promise<User> {

        const existingUser = await this.userRepository.findOne({
            where: [{ username: createUserDto.username }, { email: createUserDto.email }],
        });

        if (existingUser && existingUser.username === createUserDto.username) {
            throw new ConflictException('Username already taken.');
        }

        if (existingUser && existingUser.email === createUserDto.email) {
            throw new ConflictException('Email already in use.');
        }

        const hashedPassword = await argon2.hash(createUserDto.password);

        let role: Role | null = null;

        if (createUserDto.roleId) {

            role = await this.roleRepository.findOne({ where: { id: createUserDto.roleId } });

            if (!role) {
                throw new NotFoundException(`Role with ID "${createUserDto.roleId}" not found.`);
            }

        } else {

            role = await this.roleRepository.findOne({ where: { type: RoleType.USER } });
        }

        const { roleId, password, ...userDataFromRequest } = createUserDto as any;

        const newUser = this.userRepository.create({
            ...userDataFromRequest,
            password: hashedPassword,
            role: role ?? undefined,
        });

        const saveResult = await this.userRepository.save(newUser);

        const savedUser: User = Array.isArray(saveResult) ? saveResult[0] : saveResult;

        this.client.emit("user.created", { id: savedUser.id, username: savedUser.username, email: savedUser.email });

        console.log(`User ${savedUser.username} created. Emitted 'user.created' event.`);

        return savedUser;
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

        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (updateUserDto.password) {
            updateUserDto.password = await argon2.hash(updateUserDto.password);
        }

        Object.assign(user, updateUserDto);

        const updatedUser = await this.userRepository.save(user);

        return updatedUser;
    }

    public async remove(id: number): Promise<void> {

        const result = await this.userRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`User with ID "${id}" not found.`);
        }
    }
}
