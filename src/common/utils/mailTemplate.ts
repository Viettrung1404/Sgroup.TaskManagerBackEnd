export const VerifyEmailTemplate = {
    subject: 'Verify your email',
    content: `
        <h1>Welcome to Task Management App!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="{{activationLink}}">Verify Email</a>
        <p>If you did not sign up for this account, please ignore this email.</p>
    `,
};

export const ResetPasswordTemplate = {
    subject: 'Reset your password',
    content: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="{{resetLink}}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
    `,
};

export const InviteMemberTemplate = {
    subject: 'You are invited to join a workspace',
    content: `
        <h1>You're Invited!</h1>
        <p>You have been invited to join a workspace. Click the link below to visit:</p>
        <a href="{{inviteLink}}">Go to Workspace</a>
        <p>If you did not expect this invitation, please ignore this email.</p>
    `,
};
