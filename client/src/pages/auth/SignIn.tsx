import { SignIn } from "@clerk/react";

export const SignInPage = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignIn />
    </div>
  );
};
