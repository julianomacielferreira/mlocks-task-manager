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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import * as nodemailer from 'nodemailer';


@Injectable()
export class NotificationService {

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }

  public async createNotification(userId: number, type: string, message: string, taskId?: number): Promise<Notification> {

    try {

      const notification = this.notificationRepository.create({
        userId,
        taskId,
        message,
        type,
        isRead: false,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      this.logger.log(`Notification created for user ${userId} with type '${type}'`);

      return savedNotification;

    } catch (error) {

      this.logger.error(
        `Failed to create notification for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async sendWelcomeEmail(email: string, username: string): Promise<void> {

    try {

      const emailSubject = 'Welcome to Task Manager!';
      const emailBody = `
        <h1>Welcome, ${username}!</h1>
        <p>Thank you for joining our Task Manager application.</p>
        <p>Your account has been successfully created:</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Username: ${username}</li>
        </ul>
        <p>You can now log in and start managing your tasks.</p>
        <p>Best regards,<br/>The Task Manager Team</p>
      `;

      this.logger.log(`Sending welcome email to ${email} (${username})`);

      this.logger.debug(`Email Subject: ${emailSubject}`);

      const transporter = nodemailer.createTransport({
        host: process.env.MAILHOG_HOST || 'mailhog',
        port: parseInt(process.env.MAILHOG_PORT || '1025', 10),
        secure: false,
        auth: false,
      });

      await transporter.sendMail({
        from: 'noreply@taskmanager.com',
        to: email,
        subject: emailSubject,
        html: emailBody,
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);

    } catch (error) {

      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
        error.stack,
      );

    }
  }

  public async getNotificationsByUserId(userId: number): Promise<Notification[]> {

    try {

      const notifications = await this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${notifications.length} notifications for user ${userId}`);

      return notifications;

    } catch (error) {

      this.logger.error(
        `Failed to retrieve notifications for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async getUnreadNotifications(userId: number): Promise<Notification[]> {

    try {

      const notifications = await this.notificationRepository.find({
        where: { userId, isRead: false },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${notifications.length} unread notifications for user ${userId}`);

      return notifications;

    } catch (error) {

      this.logger.error(
        `Failed to retrieve unread notifications for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async markAsRead(notificationId: number): Promise<Notification> {

    try {

      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return null;
      }

      notification.isRead = true;

      const updatedNotification = await this.notificationRepository.save(
        notification,
      );

      this.logger.log(`Notification ${notificationId} marked as read`);

      return updatedNotification;

    } catch (error) {

      this.logger.error(
        `Failed to mark notification ${notificationId} as read: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async markAllAsRead(userId: number): Promise<number> {

    try {

      const result = await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true },
      );

      this.logger.log(`Marked ${result.affected} notifications as read for user ${userId}`);

      return result.affected;

    } catch (error) {

      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async deleteNotification(notificationId: number): Promise<boolean> {

    try {

      const result = await this.notificationRepository.delete(notificationId);

      if (result.affected === 0) {

        this.logger.warn(`Notification ${notificationId} not found for deletion`);

        return false;
      }

      this.logger.log(`Notification ${notificationId} deleted successfully`);

      return true;

    } catch (error) {

      this.logger.error(
        `Failed to delete notification ${notificationId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async deleteUserNotifications(userId: number): Promise<number> {

    try {

      const result = await this.notificationRepository.delete({ userId });

      this.logger.log(`Deleted ${result.affected} notifications for user ${userId}`);

      return result.affected;

    } catch (error) {

      this.logger.error(
        `Failed to delete notifications for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  public async getUnreadCount(userId: number): Promise<number> {

    try {

      const count = await this.notificationRepository.count({
        where: { userId, isRead: false },
      });

      return count;

    } catch (error) {

      this.logger.error(
        `Failed to get unread count for user ${userId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }
}