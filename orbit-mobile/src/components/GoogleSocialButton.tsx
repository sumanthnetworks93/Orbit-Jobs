import { Alert } from 'react-native';
import { signInWithGoogle } from '../services/auth';
import { SocialButton } from './SocialButton';

type Props = {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
};

export function GoogleSocialButton({ loading, onLoadingChange }: Props) {
  async function handlePress() {
    try {
      onLoadingChange(true);
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed.';
      Alert.alert('Sign in', message);
    } finally {
      onLoadingChange(false);
    }
  }

  return <SocialButton provider="google" testID="auth-google" loading={loading} onPress={handlePress} />;
}
