import { Router } from 'express';
import { all, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBandMember, requireRoleManager } from '../middleware/bandAccess.js';
import { HttpError } from '../utils/httpError.js';
import { isValidRole } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

function parseUserId(value) {
    const userId = Number(value);
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new HttpError(400, 'Invalid user id');
    }
    return userId;
}

router.get('/', async (req, res) => {
    const bands = await all(`
        SELECT b.id, b.name, b.created_at AS createdAt, m.role, m.created_at AS joinedAt
        FROM band_memberships m
        JOIN bands b ON b.id = m.band_id
        WHERE m.user_id = ?
        ORDER BY b.id
        `, [req.user.id]
    );
    res.json({ bands })
});

router.get('/:bandId/memberships', requireBandMember, async (req, res) => {
    const memberships = await all(`
        SELECT m.band_id AS bandId, m.user_id AS userId, m.role, m.created_at AS createdAt, u.first_name as firstName, u.last_name AS lastName, u.color
        FROM band_memberships m
        JOIN users u ON u.id = m.user_id
        WHERE m.band_id = ?
        ORDER BY m.created_at, m.user_id
        `, [req.bandId]
    );
    res.json({ memberships });
})

router.patch('/:bandId/memberships/:userId', requireBandMember, requireRoleManager, async (req, res) => {
    const role = req.body?.role;
    if (!isValidRole(role)) {
        throw new HttpError(400, 'Invalid role');
    }

    const bandId = req.bandId;
    const callerId = req.user.id;
    const targetUserId = parseUserId(req.params.userId);

    const membership = await withTransaction(async (tx) => {
        const caller = await tx.get('SELECT role FROM band_memberships WHERE band_id = ? AND user_id = ?',
            [bandId, callerId]
        );
        if (!caller || !['owner', 'admin'].includes(caller.role)) {
            throw new HttpError(403, 'Role manager permission required');
        }

        const target = await tx.get(
            `SELECT user_id AS userId, role FROM band_memberships WHERE band_id = ? AND user_id = ?`,
            [bandId, targetUserId]
        );

        if(!target) {
            throw new HttpError(404, 'Membership not found');
        }

        if(caller.role === 'admin') {
            if (targetUserId === callerId) {
                throw new HttpError(403, 'Admins can not change their own role');
            }
            if (target.role === 'owner') {
                throw new HttpError(403, 'Admins cannot change the owner');
            }
            if (!['moderator', 'member'].includes(role)) {
                throw new HttpError(403, 'Admins can only assign moderator or member')
            }

            await tx.run(
                'UPDATE band_memberships SET role = ? WHERE band_id = ? AND user_id = ?',
                [role, bandId, targetUserId]
            );
        } else {
            if (targetUserId === callerId && role !== 'owner') {
                throw new HttpError(403, 'Owner cannot demote themselves');
            }
            if (role === 'owner' && targetUserId !== callerId) {
                await tx.run("UPDATE band_memberships SET role = 'admin' WHERE band_id = ? AND user_id = ?",
                    [bandId, callerId]
                );
                await tx.run("UPDATE band_memberships SET role = 'owner' WHERE band_id = ? AND user_id = ?",
                    [bandId, targetUserId]
                );
            } else if (role !== target.role) {
                await tx.run('UPDATE band_memberships SET role = ? WHERE band_id = ? AND user_id = ?',
                    [role, bandId, targetUserId]
                );
            }
        }
        
        return tx.get(`
            SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt
            FROM band_memberships
            WHERE band_id = ? AND user_id = ?`,
            [bandId, targetUserId]
        );
    });
    res.json({ membership })
});

export default router;
