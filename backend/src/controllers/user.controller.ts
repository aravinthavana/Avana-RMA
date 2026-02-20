import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';

export class UserController {
    private userService = userService;

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.createUser(req.body);
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            res.status(201).json({ success: true, data: userWithoutPassword });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = (req as any).user;
            const userToUpdate = await this.userService.getUserById(req.params.id);

            if (!userToUpdate) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Prevent self-demotion
            if (userToUpdate.id === currentUser.id && req.body.role && req.body.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot change your own role'
                });
            }

            // Prevent demoting last admin
            if (userToUpdate.role === 'ADMIN' && req.body.role === 'USER') {
                const adminCount = await this.userService.getAdminCount();
                if (adminCount <= 1) {
                    return res.status(403).json({
                        success: false,
                        error: 'Cannot demote the last admin account'
                    });
                }
            }

            const user = await this.userService.updateUser(req.params.id, req.body);
            const { password, ...userWithoutPassword } = user;
            res.json({ success: true, data: userWithoutPassword });
        } catch (error) {
            next(error);
        }
    };

    toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = (req as any).user;
            const userToToggle = await this.userService.getUserById(req.params.id);

            if (!userToToggle) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Prevent self-deactivation
            if (userToToggle.id === currentUser.id && req.body.isActive === false) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot deactivate your own account'
                });
            }

            // Prevent deactivating last admin
            if (userToToggle.role === 'ADMIN' && req.body.isActive === false) {
                const adminCount = await this.userService.getAdminCount();
                if (adminCount <= 1) {
                    return res.status(403).json({
                        success: false,
                        error: 'Cannot deactivate the last admin account'
                    });
                }
            }

            const { isActive } = req.body;
            const user = isActive
                ? await this.userService.reactivateUser(req.params.id)
                : await this.userService.deactivateUser(req.params.id);

            const { password, ...userWithoutPassword } = user;
            res.json({ success: true, data: userWithoutPassword });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = (req as any).user;
            const userToDelete = await this.userService.getUserById(req.params.id);

            if (!userToDelete) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Prevent self-deletion
            if (userToDelete.id === currentUser.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot delete your own account'
                });
            }

            // Prevent deleting last admin
            if (userToDelete.role === 'ADMIN') {
                const adminCount = await this.userService.getAdminCount();
                if (adminCount <= 1) {
                    return res.status(403).json({
                        success: false,
                        error: 'Cannot delete the last admin account'
                    });
                }
            }

            await this.userService.deleteUser(req.params.id);
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { newPassword } = req.body;
            if (!newPassword) {
                return res.status(400).json({ success: false, error: 'New password is required' });
            }
            const user = await this.userService.resetUserPassword(req.params.id, newPassword);
            const { password, ...userWithoutPassword } = user;
            res.json({ success: true, data: userWithoutPassword, message: 'Password reset successfully' });
        } catch (error) {
            next(error);
        }
    };
}

export default new UserController();
