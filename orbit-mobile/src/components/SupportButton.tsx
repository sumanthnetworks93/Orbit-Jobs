import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { SUPPORT_EMAIL, supportMailto } from '../legal/content';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  testID?: string;
  label?: string;
};

export async function openSupportEmail() {
  const url = supportMailto();
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }
  Alert.alert('Support', `Email us at ${SUPPORT_EMAIL}`);
}

export function SupportButton({ testID = 'support-button', label = 'Support' }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={`${label} ${SUPPORT_EMAIL}`}
      onPress={() => void openSupportEmail()}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  pressed: { opacity: 0.88 },
});
