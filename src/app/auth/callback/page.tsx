import { setupUserPassword } from "./_features/actions/setup-user-password";
import { SecurePasswordForm } from "./_features/components/secure-password-form";

export default function AuthCallbackPage() {
  return (
    <SecurePasswordForm
      title="Create Your Password"
      description="Set a strong password to activate your account."
      loadingText="Verifying Invitation"
      buttonText="Set Password & Activate"
      successMessage="Password set successfully! Please log in to continue."
      onSubmitAction={setupUserPassword}
    />
  );
}
