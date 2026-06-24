import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export enum AppEvents {
  RESERVATION_CREATED = 'reservation.created',
  RESERVATION_UPDATED = 'reservation.updated',
  RESERVATION_CONFIRMED = 'reservation.confirmed',
  RESERVATION_CANCELED = 'reservation.canceled',
  RESERVATION_COMPLETED = 'reservation.completed',
  RESERVATION_NOSHOW = 'reservation.noshow',
  PAYMENT_SUCCESS = 'payment.success',
  REVIEW_CREATED = 'rating.created',

  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',
  COMMENT_APPROVED = 'comment.approved',

  REACTION_CREATED = 'reaction.created',
  REACTION_UPDATED = 'reaction.updated',
  REACTION_REMOVED = 'reaction.removed',
}
