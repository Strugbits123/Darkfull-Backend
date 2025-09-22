import { Response, Request } from 'express';
// import bcrypt from 'bcryptjs';
// import { logger } from '../utils/logger';
import { asyncHandler } from '@packages/utils/helpers/asyncHandler';


export const inviteUser = asyncHandler( async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    return res.status(200).json({ message: "User invited successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
