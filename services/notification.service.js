import Notification from '../models/Notification.js';

/**
 * Notification Service — creates notifications for various events
 */
export const createNotification = async ({
  recipient,
  type,
  referenceType,
  referenceId,
  message,
}) => {
  try {
    await Notification.create({
      recipient,
      type,
      referenceType,
      referenceId,
      message,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

export const notifyGuideApproved = async (guideAuthorId, guideId, guideTitle) => {
  await createNotification({
    recipient: guideAuthorId,
    type: 'guide_approved',
    referenceType: 'guide',
    referenceId: guideId,
    message: `Your guide "${guideTitle}" has been approved and published!`,
  });
};

export const notifyNewReview = async (targetAuthorId, reviewerName, targetType, targetId) => {
  await createNotification({
    recipient: targetAuthorId,
    type: 'review',
    referenceType: targetType,
    referenceId: targetId,
    message: `${reviewerName} left a review on your ${targetType}`,
  });
};
