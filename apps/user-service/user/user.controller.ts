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
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({ type: User })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() createUserDto: CreateUserDTO): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiOkResponse({ type: User, isArray: true })
    @Get()
    public async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @ApiOperation({ summary: 'Retrieve a user by id' })
    @ApiOkResponse({ type: User })
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a user' })
    @ApiOkResponse({ type: User })
    @Put(':id')
    public async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDTO): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 204, description: 'No content' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.userService.remove(id);
    }
}
