import { EventEmitter } from 'events';
import { env } from '../../config/env';

class ShadowEventEmitter extends EventEmitter {
  emit(eventName: string | symbol, ...args: unknown[]): boolean {
    if (env.SHADOW_MODE) {
      console.log(`[SHADOW MODE] Suppressing event: ${String(eventName)}`, args);
      return true;
    }
    return super.emit(eventName, ...args);
  }
}

export const eventEmitter = new ShadowEventEmitter();

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
