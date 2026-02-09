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

/**
 * NotificationService
 * 
 * This service handles all notification-related operations including:
 * - Creating and storing notifications in the database
 * - Sending email notifications to users
 * - Managing notification status (read/unread)
 * - Retrieving notifications for specific users
 * - Deleting notifications
 * 
 * The service used by both the microservice event handlers and potential API endpoints
 * to ensure consistent notification handling across the application.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Creates and stores a notification in the database
   * 
   * This method is called whenever an event occurs that should trigger a notification.
   * It saves the notification details to the database with the user as the recipient.
   * 
   * @param userId - The ID of the user who will receive the notification
   * @param type - The type/category of notification (e.g., 'welcome', 'task_assigned', 'task_updated')
   * @param message - The notification message content that will be displayed to the user
   * @param taskId - Optional task ID if the notification is task-related
   * @returns The created Notification entity with all fields populated
   * 
   * @example
   * await this.notificationService.createNotification(
   *   123,
   *   'task_assigned',
   *   'Task "Review Documentation" has been assigned to you.',
   *   456
   * );
   */
  async createNotification(
    userId: number,
    type: string,
    message: string,
    taskId?: number,
  ): Promise<Notification> {
    try {
      // Create a new Notification entity instance
      const notification = this.notificationRepository.create({
        userId,
        taskId,
        message,
        type,
        isRead: false, // New notifications are unread by default
      });

      // Save the notification to the database
      const savedNotification = await this.notificationRepository.save(
        notification,
      );

      this.logger.log(
        `Notification created for user ${userId} with type '${type}'`,
      );

      return savedNotification;
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Sends a welcome email to a newly registered user
   * 
   * This method is triggered when a new user joins the application. It performs two actions:
   * 1. Sends an email with welcome message and account information
   * 2. Creates a welcome notification in the system
   * 
   * Note: For now, this logs email sending (useful for development/testing).
   * In production, integrate with an email service (e.g., SendGrid, Brevo, SMTP).
   * 
   * @param email - The email address of the user to send the welcome email to
   * @param username - The username of the newly registered user
   * 
   * @example
   * await this.notificationService.sendWelcomeEmail(
   *   'john@example.com',
   *   'johndoe'
   * );
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    try {
      // Email content for the welcome message
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

      // Log email sending (in production, replace with actual email service)
      this.logger.log(
        `Sending welcome email to ${email} (${username})`,
      );
      this.logger.debug(`Email Subject: ${emailSubject}`);

      // TODO: Integrate with email service provider (SendGrid, Brevo, SMTP, etc.)
      // Example implementation with nodemailer:
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({
      //   from: 'noreply@taskmanager.com',
      //   to: email,
      //   subject: emailSubject,
      //   html: emailBody,
      // });

      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
        error.stack,
      );
      // Don't throw - email failure shouldn't block user creation
    }
  }

  /**
   * Retrieves all notifications for a specific user
   * 
   * Fetches all notifications belonging to a user, ordered from newest to oldest.
   * This is useful for displaying a notification history or timeline to the user.
   * 
   * @param userId - The ID of the user whose notifications to retrieve
   * @returns Array of Notification entities for the specified user
   * 
   * @example
   * const notifications = await this.notificationService.getNotificationsByUserId(123);
   * console.log(`User has ${notifications.length} notifications`);
   */
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    try {
      const notifications = await this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }, // Most recent first
      });

      this.logger.log(
        `Retrieved ${notifications.length} notifications for user ${userId}`,
      );

      return notifications;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieves unread notifications for a specific user
   * 
   * Fetches only unread notifications for a user. This is useful for:
   * - Showing notification badges/counters
   * - Displaying only new notifications to the user
   * - Implementing notification centers
   * 
   * @param userId - The ID of the user whose unread notifications to retrieve
   * @returns Array of unread Notification entities for the specified user
   * 
   * @example
   * const unreadCount = await this.notificationService.getUnreadNotifications(123);
   * console.log(`User has ${unreadCount.length} unread notifications`);
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const notifications = await this.notificationRepository.find({
        where: { userId, isRead: false },
        order: { createdAt: 'DESC' }, // Most recent first
      });

      this.logger.log(
        `Retrieved ${notifications.length} unread notifications for user ${userId}`,
      );

      return notifications;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve unread notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Marks a specific notification as read
   * 
   * Updates a notification's read status to true. This is called when a user
   * views or acknowledges a notification. Useful for:
   * - Updating notification UI (removing unread indicators)
   * - Tracking user engagement
   * - Cleaning up notification badges
   * 
   * @param notificationId - The ID of the notification to mark as read
   * @returns The updated Notification entity
   * 
   * @example
   * await this.notificationService.markAsRead(456);
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    try {
      // Find the notification by ID
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return null;
      }

      // Update the isRead flag to true
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

  /**
   * Marks all notifications for a user as read
   * 
   * Updates all unread notifications for a specific user to read status.
   * This is useful for:
   * - Clearing notification badges
   * - "Mark all as read" functionality
   * - Bulk notification management
   * 
   * @param userId - The ID of the user whose notifications should be marked as read
   * @returns The count of notifications that were updated
   * 
   * @example
   * const count = await this.notificationService.markAllAsRead(123);
   * console.log(`Marked ${count} notifications as read`);
   */
  async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true },
      );

      this.logger.log(
        `Marked ${result.affected} notifications as read for user ${userId}`,
      );

      return result.affected;
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Deletes a specific notification
   * 
   * Removes a notification from the database. This is useful for:
   * - User-initiated deletion action
   * - Cleaning up old/obsolete notifications
   * - Managing notification storage
   * 
   * @param notificationId - The ID of the notification to delete
   * @returns Boolean indicating whether the deletion was successful
   * 
   * @example
   * const success = await this.notificationService.deleteNotification(456);
   * if (success) console.log('Notification deleted');
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
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

  /**
   * Deletes all notifications for a user (optional cleanup method)
   * 
   * Removes all notifications for a specific user from the database.
   * Use with caution as this is a destructive operation.
   * 
   * @param userId - The ID of the user whose notifications should be deleted
   * @returns The count of notifications that were deleted
   * 
   * @example
   * const count = await this.notificationService.deleteUserNotifications(123);
   * console.log(`Deleted ${count} notifications`);
   */
  async deleteUserNotifications(userId: number): Promise<number> {
    try {
      const result = await this.notificationRepository.delete({ userId });

      this.logger.log(
        `Deleted ${result.affected} notifications for user ${userId}`,
      );

      return result.affected;
    } catch (error) {
      this.logger.error(
        `Failed to delete notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets unread notification count for a user
   * 
   * Returns the count of unread notifications for displaying badge notifications.
   * 
   * @param userId - The ID of the user
   * @returns The count of unread notifications
   * 
   * @example
   * const count = await this.notificationService.getUnreadCount(123);
   * console.log(`User has ${count} unread notifications`);
   */
  async getUnreadCount(userId: number): Promise<number> {
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