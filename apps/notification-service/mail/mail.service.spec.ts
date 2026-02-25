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
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';
import { Logger } from '@nestjs/common';

describe('MailService', () => {

    let sendMailMock: jest.Mock;
    let service: MailService;

    beforeEach(() => {
        jest.restoreAllMocks();

        sendMailMock = jest.fn().mockResolvedValue(true);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

        jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
            sendMail: sendMailMock,
        } as any);

        service = new MailService();
    });

    afterEach(() => jest.clearAllMocks());

    it('initializes transporter with pooling', () => {

        expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        }));

        expect(Logger.prototype.log).toHaveBeenCalledWith('Mail transporter initialized with pooling');
    });

    describe('sendWelcomeEmail', () => {

        it('sends welcome email', async () => {

            await expect(service.sendWelcomeEmail('ju.maciel.ferreira@gmail.com', 'juliano')).resolves.toBeUndefined();

            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
                to: 'ju.maciel.ferreira@gmail.com',
                subject: expect.any(String),
                html: expect.any(String),
            }));
        });

        it('logs and rethrows when transporter fails', async () => {

            sendMailMock.mockRejectedValueOnce(new Error('smtp down'));

            await expect(service.sendWelcomeEmail('ju.maciel.ferreira@gmail.com', 'juliano')).rejects.toThrow('smtp down');
            expect(Logger.prototype.error).toHaveBeenCalled();
        });
    });

    describe('sendTaskAssignedEmail', () => {

        it('sends task assigned email with correct subject', async () => {

            await expect(service.sendTaskAssignedEmail('ju.maciel.ferreira@gmail.com', 'My Task')).resolves.toBeUndefined();

            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
                to: 'ju.maciel.ferreira@gmail.com',
                subject: 'New Task Assigned',
                html: expect.any(String),
            }));
        });

        it('logs and rethrows when transporter fails', async () => {

            sendMailMock.mockRejectedValueOnce(new Error('smtp fail'));

            await expect(service.sendTaskAssignedEmail('ju.maciel.ferreira@gmail.com', 'My Task')).rejects.toThrow('smtp fail');
            expect(Logger.prototype.error).toHaveBeenCalled();
        });
    });
});
