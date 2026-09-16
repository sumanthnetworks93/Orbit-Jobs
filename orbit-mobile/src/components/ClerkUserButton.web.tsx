import { Show, UserButton } from '@clerk/expo/web';

export function ClerkUserButton() {
  return (
    <Show when="signed-in">
      <div data-testid="clerk-user-button" style={{ display: 'flex', justifyContent: 'center' }}>
        <UserButton />
      </div>
    </Show>
  );
}
