import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Provider = 'apple' | 'google' | 'linkedin' | 'github';

type Props = {
  provider: Provider;
  onPress: () => void;
  loading?: boolean;
  testID?: string;
  label?: string;
};

const LABELS: Record<Provider, string> = {
  apple: 'Continue with Apple',
  google: 'Continue with Google',
  linkedin: 'Continue with LinkedIn',
  github: 'Continue with GitHub',
};

function ProviderIcon({ provider }: { provider: Provider }) {
  const iconStyle = provider === 'apple' ? styles.appleIcon : styles.iconText;

  const glyphs: Record<Provider, string> = {
    apple: '',
    google: 'G',
    linkedin: 'in',
    github: '⌘',
  };

  if (provider === 'apple') {
    return <Text style={iconStyle}></Text>;
  }

  return (
    <View style={[styles.iconWrap, provider === 'linkedin' && styles.linkedinIcon]}>
      <Text style={[iconStyle, provider === 'linkedin' && styles.linkedinText]}>
        {glyphs[provider]}
      </Text>
    </View>
  );
}

export function SocialButton({ provider, onPress, loading, testID, label }: Props) {
  const isApple = provider === 'apple';

  return (
    <Pressable
      testID={testID ?? `auth-${provider}`}
      accessibilityLabel={label ?? LABELS[provider]}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        isApple ? styles.appleButton : styles.outlineButton,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isApple ? colors.white : colors.ink} />
      ) : (
        <>
          <ProviderIcon provider={provider} />
          <Text style={[styles.label, isApple && styles.appleLabel]}>{label ?? LABELS[provider]}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  appleButton: {
    backgroundColor: colors.black,
  },
  outlineButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  appleLabel: {
    color: colors.white,
  },
  appleIcon: {
    color: colors.white,
    fontSize: 18,
  },
  iconWrap: {
    width: 22,
    alignItems: 'center',
  },
  iconText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  linkedinIcon: {
    backgroundColor: '#0A66C2',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  linkedinText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
