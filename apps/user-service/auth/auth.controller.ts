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
    Post,
    Body,
    UseGuards,
    Request,
    UnauthorizedException
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO } from '@app/auth';
import { User } from '../user/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Login and receive a JWT' })
    @ApiOkResponse({ description: 'Login successful' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @Post('login')
    public async login(@Body() loginDto: LoginDTO) {

        const user = await this.authService.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.authService.login(user);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get authenticated user profile' })
    @ApiOkResponse({ type: User })
    @ApiUnauthorizedResponse({ description: 'Unauthorized or invalid token' })
    @UseGuards(AuthGuard('jwt'))
    @Post('profile')
    public async getProfile(@Request() req) {

        const userPayload = req.user || {};

        const userId = userPayload.id ?? userPayload.userId;

        if (!userId) {
            throw new UnauthorizedException('User ID not found in token payload');
        }

        const user: User = await this.authService.findOne(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...safeUser } = user;

        return safeUser;
    }
}