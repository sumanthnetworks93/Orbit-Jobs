import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLegalDoc, type LegalDocId } from '../legal/content';
import { SupportButton } from './SupportButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  docId: LegalDocId | null;
  onClose: () => void;
};

export function LegalSheet({ docId, onClose }: Props) {
  const doc = docId ? getLegalDoc(docId) : null;
  if (!doc) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet} testID={`legal-sheet-${doc.id}`}>
        <Text style={styles.title}>{doc.title}</Text>
        <Text style={styles.updated}>Updated {doc.updated}</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
          {doc.sections.map((section) => (
            <View key={section.heading} style={styles.block}>
              <Text style={styles.heading}>{section.heading}</Text>
              <Text style={styles.copy}>{section.body}</Text>
            </View>
          ))}
        </ScrollView>
        <Pressable testID="legal-close" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

type LinksProps = {
  onOpen: (id: LegalDocId) => void;
};

export function LegalLinks({ onOpen }: LinksProps) {
  return (
    <View style={styles.links} testID="legal-links">
      <Pressable testID="legal-link-privacy" onPress={() => onOpen('privacy')}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable testID="legal-link-terms" onPress={() => onOpen('terms')}>
        <Text style={styles.link}>Terms for seekers</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable testID="legal-link-terms-employer" onPress={() => onOpen('termsEmployer')}>
        <Text style={styles.link}>Terms for employers</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable testID="legal-link-notice" onPress={() => onOpen('notice')}>
        <Text style={styles.link}>Privacy Notice</Text>
      </Pressable>
    </View>
  );
}

export function LegalSupportBlock() {
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  return (
    <View style={styles.supportBlock}>
      <LegalLinks onOpen={setLegalDoc} />
      <SupportButton />
      <LegalSheet docId={legalDoc} onClose={() => setLegalDoc(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(22,20,15,0.28)' },
  sheet: {
    marginTop: 'auto',
    maxHeight: '88%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
  },
  title: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.ink },
  updated: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
  scroll: { marginTop: 16, maxHeight: 420 },
  body: { paddingBottom: 12 },
  block: { marginBottom: 16 },
  heading: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  copy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted },
  close: {
    marginTop: 12,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontFamily: fonts.medium, fontSize: 15, color: colors.white },
  pressed: { opacity: 0.88 },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  dot: { fontFamily: fonts.regular, fontSize: 13, color: colors.label },
  supportBlock: {
    marginTop: 20,
    gap: 14,
  },
});
