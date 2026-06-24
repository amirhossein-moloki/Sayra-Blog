import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from '../modules/auth/auth.routes';
import gamingCenterRouter from '../modules/gamingCenter/gamingCenter.routes';
import staffRouter from '../modules/users/users.routes';
import { settingsRouter } from '../modules/settings/settings.routes';
import auditRoutes from '../modules/audit/audit.routes';
import { taxonomyRouter } from '../modules/taxonomy/taxonomy.routes';
import { postsRouter } from '../modules/posts/posts.routes';
import { commentsRouter } from '../modules/comments/comments.routes';
import { reactionsRouter } from '../modules/reactions/reactions.routes';
import { webhooksRoutes } from '../modules/webhooks/webhooks.routes';

const router = Router();

// --- Existing Routes ---
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/gamingCenters', gamingCenterRouter);

// --- Staff Module Routes ---
router.use('/gamingCenters/:gamingCenterId/staff', staffRouter);

// --- Settings Module Routes ---
router.use('/gamingCenters/:gamingCenterId/settings', settingsRouter);

// --- Audit Module Routes ---
router.use('/gamingCenters/:gamingCenterId/audit-logs', auditRoutes);

// --- Taxonomy Module Routes ---
router.use('/gamingCenters/:gamingCenterId/taxonomy', taxonomyRouter);

// --- Posts Module Routes ---
router.use('/gamingCenters/:gamingCenterId/posts', postsRouter);

// --- Comments Module Routes ---
router.use('/gamingCenters/:gamingCenterId/comments', commentsRouter);

// --- Reactions Module Routes ---
router.use('/gamingCenters/:gamingCenterId/reactions', reactionsRouter);

// --- Webhooks Module ---
router.use(webhooksRoutes);


export default router;
