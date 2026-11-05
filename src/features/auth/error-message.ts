export function authErrorMessage(
  status: number | undefined,
  signUp: boolean,
): string {
  if (status === 429)
    return "Too many attempts. Please wait before trying again; repeated requests will not bypass the limit.";
  if (status === 503)
    return "Sign-in is temporarily unavailable. Please try again shortly.";
  return signUp
    ? "Unable to create your account. Check your details or try signing in."
    : "Unable to sign in. Check your email/password or try again shortly.";
}
