const mongoose = require('mongoose');
const Notification = require('../models/Notification');

describe('Notification Model', () => {
  describe('Notification creation', () => {
    test('should create a notification with valid data', () => {
      const notificationData = {
        id: 'notif-1',
        recipient: 'Janelle',
        sender: 'Faris',
        type: 'Follow',
        message: 'Faris started following your profile!'
      };

      const notification = new Notification(notificationData);
      expect(notification.id).toBe('notif-1');
      expect(notification.recipient).toBe('Janelle');
      expect(notification.sender).toBe('Faris');
      expect(notification.type).toBe('Follow');
      expect(notification.message).toBe('Faris started following your profile!');
    });

    test('should require recipient', () => {
      const notificationData = {
        id: 'notif-2',
        sender: 'Faris',
        type: 'Follow',
        message: 'Faris started following your profile!'
      };

      const notification = new Notification(notificationData);
      expect(notification.recipient).toBeUndefined();
    });

    test('should require message', () => {
      const notificationData = {
        id: 'notif-3',
        recipient: 'Janelle',
        sender: 'Faris',
        type: 'Follow'
      };

      const notification = new Notification(notificationData);
      expect(notification.message).toBeUndefined();
    });

    test('should set default isRead flag to false', () => {
      const notificationData = {
        id: 'notif-4',
        recipient: 'Janelle',
        sender: 'Faris',
        type: 'Follow',
        message: 'Faris started following your profile!'
      };

      const notification = new Notification(notificationData);
      expect(notification.isRead).toBe(false);
    });

    test('should set default timestamps', () => {
      const notificationData = {
        id: 'notif-5',
        recipient: 'Janelle',
        sender: 'Faris',
        type: 'Follow',
        message: 'Faris started following your profile!'
      };

      const notification = new Notification(notificationData);
      expect(notification.createdAt).toBeDefined();
      expect(notification.updatedAt).toBeDefined();
    });
  });
});