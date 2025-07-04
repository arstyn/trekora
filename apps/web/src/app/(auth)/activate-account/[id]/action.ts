'use server';

type ActivationResult = {
  success: boolean;
  message: string;
  status: 'success' | 'error' | 'expired' | 'invalid' | 'already_active';
};

export async function activateUser(
  token: string,
  userId: string,
): Promise<ActivationResult> {
  try {
    // In a real app, you'd connect to your database here
    // Example with a database query:
    // const user = await db.user.findUnique({ where: { id: userId } })
    // const activationToken = await db.activationToken.findUnique({ where: { token } })

    // Mock validation - replace with your actual database logic
    if (!token || token.length < 10) {
      return {
        success: false,
        message: 'Invalid activation token',
        status: 'invalid',
      };
    }

    if (!userId) {
      return {
        success: false,
        message: 'Invalid user ID',
        status: 'invalid',
      };
    }

    // Mock check for expired token (replace with actual logic)
    // const isExpired = new Date() > activationToken.expiresAt
    const isExpired = false; // Mock value

    if (isExpired) {
      return {
        success: false,
        message: 'This activation link has expired. Please request a new one.',
        status: 'expired',
      };
    }

    // Mock check if user is already active
    // const user = await getUserById(userId)
    const isAlreadyActive = false; // Mock value

    if (isAlreadyActive) {
      return {
        success: true,
        message: 'Your account is already active!',
        status: 'already_active',
      };
    }

    // Activate the user (replace with actual database update)
    // await db.user.update({
    //   where: { id: userId },
    //   data: { isActive: true, emailVerified: true }
    // })
    //
    // await db.activationToken.delete({
    //   where: { token }
    // })

    return {
      success: true,
      message: 'Your account has been successfully activated!',
      status: 'success',
    };
  } catch (error) {
    console.error('Activation error:', error);
    return {
      success: false,
      message:
        'An error occurred while activating your account. Please try again.',
      status: 'error',
    };
  }
}
