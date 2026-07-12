import { SecurePasswordForm } from "../callback/_features/components/secure-password-form";
import { updateUserPassword } from "./_features/actions/update-user-password";

export default function UpdatePasswordPage() {
  return (
    <SecurePasswordForm
      title="Update Your Password"
      description="Set a strong password to secure your account."
      loadingText="Verifying Reset Link"
      buttonText="Update Password"
      successMessage="Password updated successfully! Please log in with your new password."
      onSubmitAction={updateUserPassword}
    />
  );
}
