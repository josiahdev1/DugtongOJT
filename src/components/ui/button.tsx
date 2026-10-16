import { PendingButton, type ButtonProps } from "./button-client";

export { buttonVariants } from "./button-variants";
export type { ButtonProps };

// Same Button as before, so no page needs to change. It stays a plain
// (server-safe) module so server pages can keep calling buttonVariants();
// the form-status logic lives in button-client.tsx.
export function Button(props: ButtonProps) {
  return <PendingButton {...props} />;
}
