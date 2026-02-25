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
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name);
    private readonly transporter: nodemailer.Transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            host: process.env.MAILHOG_HOST || 'mailhog',
            port: parseInt(process.env.MAILHOG_PORT || '1025', 10),
            secure: false,
            auth: false,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });

        this.logger.log('Mail transporter initialized with pooling');
    }

    public async sendWelcomeEmail(email: string, username: string): Promise<void> {

        const subject = 'Welcome to Task Manager!';
        const html = `<h1>Welcome, ${username}!</h1>
                      <p>Your account has been created.</p>
                    `;

        try {

            await this.transporter.sendMail({
                from: 'noreply@taskmanager.com',
                to: email,
                subject,
                html,
            });

            this.logger.log(`Welcome email sent to ${email}`);

        } catch (error) {

            this.logger.error(
                `Failed to send email to ${email}: ${error.message}`,
                error.stack,
            );

            throw error;
        }
    }

    public async sendTaskAssignedEmail(email: string, title: string): Promise<void> {

        const html = `<h2>New Task Assigned</h2>
                      <p>You have been assigned to:</p>
                      <strong>${title}</strong>
                    `;

        const subject = 'New Task Assigned';

        try {

            await this.transporter.sendMail({
                from: 'noreply@taskmanager.com',
                to: email,
                subject,
                html,
            });

            this.logger.log(`Task assigned email sent to ${email}`);

        } catch (error) {

            this.logger.error(
                `Failed to send task assigned email to ${email}: ${error.message}`,
                error.stack,
            );

            throw error;
        }
    }
}