import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { submitEasyApply } from '../hyd/applications';
import { isValidIndianMobile } from '../hyd/customerSecurity';
import { useLanguage } from '../hyd/LanguageContext';
import { parseVoiceResume } from '../hyd/voice';
import { maskPhone, relayTel, whatsappUrl } from '../hyd/whatsapp';
import { useAuth } from '../context/AuthContext';
import { isGuestApplyEnabled, isWhatsAppRelayEnabled } from '../services/adminControl';
import { isGuestSession } from '../services/auth';
import { recordAppliedJob } from '../services/appliedJobs';
import { getSavedResume } from '../services/simpleResume';
import type { Job } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  job: Job | null;
  visible: boolean;
  onClose: () => void;
};

export function ApplySheet({ job, visible, onClose }: Props) {
  const { copy } = useLanguage();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [lastJob, setLastJob] = useState('');
  const [joinWhen, setJoinWhen] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [resume, setResume] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setConsent(false);
    void getSavedResume().then((saved) => {
      if (!saved) return;
      setName((current) => current || saved.name);
      setArea((current) => current || saved.area);
      setLastJob((current) => current || saved.lastJob);
      setJoinWhen((current) => current || saved.joinWhen);
    });
  }, [visible]);

  if (!job) return null;

  function fillFromVoice() {
    const sample = voiceNote.trim() || 'I am Priya nurse from Gachibowli I can join immediate';
    const parsed = parseVoiceResume(sample);
    setName((current) => current || parsed.name);
    setArea((current) => current || parsed.area);
    setLastJob((current) => current || parsed.lastJob);
    setJoinWhen((current) => current || parsed.joinWhen);
    setVoiceNote(sample);
  }

  async function submit(channel: 'form' | 'voice' | 'whatsapp') {
    if (!job) return;
    if (!isGuestApplyEnabled() && isGuestSession(user)) {
      Alert.alert('Apply paused', 'Super Admin has turned off guest apply.');
      return;
    }
    if (channel === 'whatsapp' && !isWhatsAppRelayEnabled()) {
      Alert.alert('WhatsApp paused', 'Super Admin has turned off the WhatsApp relay.');
      return;
    }
    if (!consent) {
      Alert.alert(copy.apply, 'Tick the box to share this apply with the employer. They see a masked phone, not your personal number.');
      return;
    }
    if (!name.trim() || !phone.trim() || !area.trim() || !lastJob.trim() || !joinWhen.trim()) {
      Alert.alert(copy.apply, 'Fill the 6 fields. No resume PDF needed.');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      Alert.alert(copy.apply, 'Enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      const application = await submitEasyApply({
        job,
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        lastJob: lastJob.trim(),
        joinWhen: joinWhen.trim(),
        voiceNote: voiceNote.trim() || undefined,
        channel,
      });
      setResume(application.resumeText);
      await recordAppliedJob(job);

      if (channel === 'whatsapp') {
        const url = whatsappUrl(job.title, job.company, name.trim());
        const opened = await Linking.canOpenURL(url);
        if (opened) await Linking.openURL(url);
      }

      Alert.alert(copy.generateResume, application.resumeText);
      onClose();
    } catch (error) {
      Alert.alert(copy.apply, error instanceof Error ? error.message : 'Could not save this apply.');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet} testID="apply-sheet">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
          <Text style={styles.title}>{copy.apply}</Text>
          <Text style={styles.meta}>
            {job.title} · {job.company}
          </Text>
          <Text style={styles.helper}>{copy.sixField}</Text>
          <Field label="1. Name" testID="apply-name" value={name} onChange={setName} maxLength={80} />
          <Field
            label="2. Phone"
            testID="apply-phone"
            value={phone}
            onChange={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <Field label="3. Area" testID="apply-area" value={area} onChange={setArea} placeholder="Gachibowli" maxLength={64} />
          <Field label="4. Last job" testID="apply-last-job" value={lastJob} onChange={setLastJob} maxLength={128} />
          <Field label="5. When can you join" testID="apply-join" value={joinWhen} onChange={setJoinWhen} maxLength={64} />
          <Field
            label={`6. ${copy.voiceResume}`}
            testID="apply-voice"
            value={voiceNote}
            onChange={setVoiceNote}
            placeholder="Speak or type: I am Priya nurse from Gachibowli..."
            maxLength={400}
          />
          <Pressable testID="apply-fill-voice" onPress={fillFromVoice} style={styles.ghost}>
            <Text style={styles.ghostText}>Use voice sample</Text>
          </Pressable>
          <Pressable
            testID="apply-consent"
            onPress={() => setConsent((value) => !value)}
            style={styles.consentRow}
          >
            <View style={[styles.check, consent && styles.checkOn]} />
            <Text style={styles.consent}>
              I understand this employer will see my name, area, work history, and a masked phone. Orbit will not give out my personal mobile.
            </Text>
          </Pressable>
          <Text style={styles.mask}>{maskPhone(job.employerPhone)}</Text>
          <View style={styles.row}>
            <Pressable testID="apply-submit" onPress={() => void submit('form')} style={styles.primary}>
              <Text style={styles.primaryText}>{copy.applyNow}</Text>
            </Pressable>
            {isWhatsAppRelayEnabled() ? (
              <Pressable testID="apply-whatsapp" onPress={() => void submit('whatsapp')} style={styles.ghost}>
                <Text style={styles.ghostText}>{copy.whatsapp}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => {
                void Linking.openURL(relayTel());
              }}
              style={styles.ghost}
            >
              <Text style={styles.ghostText}>{copy.maskedCall}</Text>
            </Pressable>
          </View>
          {resume ? <Text style={styles.resume}>{resume}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  testID,
  keyboardType,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testID?: string;
  keyboardType?: 'default' | 'phone-pad';
  maxLength?: number;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.label}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoComplete="off"
        textContentType={keyboardType === 'phone-pad' ? 'telephoneNumber' : 'none'}
        style={styles.input}
      />
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
    padding: 22,
    paddingBottom: 32,
  },
  title: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 4 },
  helper: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginVertical: 10 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.label, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  mask: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, marginVertical: 8 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8, marginBottom: 4 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.ink,
    marginTop: 2,
    backgroundColor: colors.white,
  },
  checkOn: { backgroundColor: colors.ink },
  consent: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  primary: {
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 13 },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  ghostText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  resume: { marginTop: 12, fontFamily: fonts.regular, fontSize: 13, color: colors.ink, lineHeight: 20 },
});
