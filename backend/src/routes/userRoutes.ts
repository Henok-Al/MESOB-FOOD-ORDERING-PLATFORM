import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { protect, requirePermission } from '../middleware/auth';
import { Permission } from '../config/permissions';

const router = express.Router();

router.use(protect);
router.use(requirePermission(Permission.MANAGE_USERS));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUserById)
    .patch(updateUser)
    .delete(deleteUser);

export default router;
