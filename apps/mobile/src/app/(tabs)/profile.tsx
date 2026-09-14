import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/theme';
import {
  Moon,
  Sun,
  Monitor,
  Pencil,
  Bell,
  Info,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  MessageSquare,
  Headphones,
  LogOut,
  Trash2,
  AlertTriangle,
  MessageSquareHeart,
} from 'lucide-react-native';
import { CustomClockIcon } from '@/components/custom-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const AVATAR_SIZE = 148;
const EDIT_SIZE = 36;

// Clean vector avatar placeholder fitting 100% of the ring with zero whitespace
function AvatarPlaceholder({ size, isDark, primaryColor }: { size: number; isDark: boolean; primaryColor: string }) {
  const bg = isDark ? '#27272a' : '#f0eef5';
  const personColor = isDark ? '#52525b' : '#94a3b8';

  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {/* Background fill */}
      <Circle cx="50" cy="50" r="50" fill={bg} />
      {/* Head circle - radius 18 */}
      <Circle cx="50" cy="41" r="18" fill={personColor} />
      {/* Shoulder dome path touching bottom and sides seamlessly */}
      <Path
        d="M 5 105 C 5 72, 24 67, 50 67 C 76 67, 95 72, 95 105 Z"
        fill={personColor}
      />
    </Svg>
  );
}

// Custom elongated Pill Toggle Switch
function ToggleSwitch({
  value,
  onValueChange,
  activeColor,
  isDark,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  activeColor: string;
  isDark: boolean;
}) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 50,
    }).start();
  }, [value]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? '#27272a' : '#e5e7eb', activeColor],
  });

  const thumbTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 27],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={10}>
      <Animated.View
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          backgroundColor: trackBg,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#ffffff',
            transform: [{ translateX: thumbTranslateX }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1.5 },
            shadowOpacity: 0.2,
            shadowRadius: 2.5,
            elevation: 3,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const selectedTheme = useThemeStore((state) => state.selectedOption);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [notificationsOn, setNotificationsOn] = React.useState(true);
  const [showPublicModal, setShowPublicModal] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteInput, setDeleteInput] = React.useState('');

  // Support Form Modal State
  const [showSupportModal, setShowSupportModal] = React.useState(false);
  const [supportName, setSupportName] = React.useState('');
  const [supportEmail, setSupportEmail] = React.useState('');
  const [supportIssue, setSupportIssue] = React.useState('');

  // Feedback Form Modal State
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');

  const primary = Colors.light.primary;

  // Load profile data on mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setName(parsed.name);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.avatarUri) setAvatarUri(parsed.avatarUri);
        }
      } catch (e) {
        console.error('Failed to load profile data', e);
      }
    };
    loadProfile();
  }, []);

  // Save profile data on change
  const saveProfileData = async (updatedName: string, updatedEmail: string, updatedAvatar: string | null) => {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify({
        name: updatedName,
        email: updatedEmail,
        avatarUri: updatedAvatar
      }));
    } catch (e) {
      console.error('Failed to save profile data', e);
    }
  };

  const handleNameChange = (text: string) => {
    const limited = text.slice(0, 20);
    setName(limited);
    saveProfileData(limited, email, avatarUri);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    saveProfileData(name, text, avatarUri);
  };

  const handleAvatarChange = (uri: string | null) => {
    setAvatarUri(uri);
    saveProfileData(name, email, uri);
  };

  const setScheme = (newScheme: 'light' | 'dark' | 'system') => {
    useThemeStore.getState().setColorScheme(newScheme);
  };

  const handlePickImage = async () => {
    Alert.alert('Profile Photo', 'Choose a photo source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            handleAvatarChange(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access is required.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            handleAvatarChange(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, isDark ? styles.bgDark : styles.bgLight]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}
      >
        {/* ── Non-sticky Top Back Chevron ── */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={() => router.back()}
            style={styles.topBackBtn}
            hitSlop={15}
          >
            <ChevronLeft size={26} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, { borderColor: primary }]}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                : <AvatarPlaceholder size={AVATAR_SIZE} isDark={isDark} primaryColor={primary} />
              }
            </View>
            <Pressable style={[styles.editBtn, { backgroundColor: primary }]} onPress={handlePickImage} hitSlop={10}>
              <Pencil size={15} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {/* ── Fields ── */}
        <View style={styles.content}>

          {/* Name */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>Name</Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <TextInput
              style={[styles.fieldInput, isDark ? styles.inputTextDark : styles.inputTextLight]}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
              value={name}
              onChangeText={handleNameChange}
              maxLength={20}
              returnKeyType="next"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { marginTop: 22 }]}>Email</Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <TextInput
              style={[styles.fieldInput, isDark ? styles.inputTextDark : styles.inputTextLight]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>

          {/* ── Permissions ── */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { marginTop: 28 }]}>
            Permissions
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>

            {/* Make routines public — routine clock tab icon + info button */}
            <View style={styles.row}>
              <CustomClockIcon size={20} color={isDark ? '#a1a1aa' : '#6b7280'} />
              <View style={styles.labelWithInfo}>
                <Text style={[styles.rowText, isDark ? styles.textDark : styles.textLight]}>
                  Make your routines public
                </Text>
                <Pressable
                  onPress={() => setShowPublicModal(true)}
                  hitSlop={8}
                  style={styles.infoBtn}
                >
                  <Info size={16} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                </Pressable>
              </View>
              <ToggleSwitch
                value={isPublic}
                onValueChange={setIsPublic}
                activeColor={primary}
                isDark={isDark}
              />
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* Allow Notifications — plain bell, muted color, no circle */}
            <View style={styles.row}>
              <Bell size={18} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.rowText, { flex: 1 }, isDark ? styles.textDark : styles.textLight]}>
                Allow Notifications
              </Text>
              <ToggleSwitch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                activeColor={primary}
                isDark={isDark}
              />
            </View>
          </View>

          {/* ── Appearance ── */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { marginTop: 28 }]}>
            Appearance
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <Pressable style={styles.option} onPress={() => setScheme('light')}>
              <View style={styles.optionLeft}>
                <Sun size={20} color={isDark ? '#a1a1aa' : '#4b5563'} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>Light Mode</Text>
              </View>
              <View style={[styles.radio, selectedTheme === 'light' && styles.radioActive]} />
            </Pressable>
            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
            <Pressable style={styles.option} onPress={() => setScheme('dark')}>
              <View style={styles.optionLeft}>
                <Moon size={20} color={isDark ? '#a1a1aa' : '#4b5563'} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>Dark Mode</Text>
              </View>
              <View style={[styles.radio, selectedTheme === 'dark' && styles.radioActive]} />
            </Pressable>
            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
            <Pressable style={styles.option} onPress={() => setScheme('system')}>
              <View style={styles.optionLeft}>
                <Monitor size={20} color={isDark ? '#a1a1aa' : '#4b5563'} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>System Default</Text>
              </View>
              <View style={[styles.radio, selectedTheme === 'system' && styles.radioActive]} />
            </Pressable>
          </View>

          {/* ── Support & Feedback ── */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { marginTop: 28 }]}>
            Support & Feedback
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            {/* FAQ - Opens Dedicated Screen */}
            <Pressable
              style={styles.option}
              onPress={() => router.push('/faq' as any)}
            >
              <View style={styles.optionLeft}>
                <HelpCircle size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>
                  FAQ
                </Text>
              </View>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
            </Pressable>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* Support - Opens Modal Form */}
            <Pressable
              style={styles.option}
              onPress={() => {
                setSupportName(name);
                setSupportEmail(email);
                setSupportIssue('');
                setShowSupportModal(true);
              }}
            >
              <View style={styles.optionLeft}>
                <Headphones size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>
                  Support
                </Text>
              </View>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
            </Pressable>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* Feedback - Opens Feedback Modal */}
            <Pressable
              style={styles.option}
              onPress={() => {
                setFeedbackText('');
                setShowFeedbackModal(true);
              }}
            >
              <View style={styles.optionLeft}>
                <MessageSquareHeart size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>
                  Feedback
                </Text>
              </View>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
            </Pressable>
          </View>

          {/* ── About & Legal ── */}
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight, { marginTop: 28 }]}>
            About & Legal
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            {/* Privacy Policy */}
            <Pressable
              style={styles.option}
              onPress={() => router.push('/privacy-policy' as any)}
            >
              <View style={styles.optionLeft}>
                <ShieldCheck size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>
                  Privacy Policy
                </Text>
              </View>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
            </Pressable>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* Terms of Service */}
            <Pressable
              style={styles.option}
              onPress={() => router.push('/terms-of-service' as any)}
            >
              <View style={styles.optionLeft}>
                <FileText size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight]}>
                  Terms of Service
                </Text>
              </View>
              <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
            </Pressable>
          </View>

          {/* ── Bottom Account Action Buttons (Log Out & Delete Account) ── */}
          <View style={styles.accountActionRow}>
            <Pressable
              style={[styles.accountBtn, isDark ? styles.logoutBtnDark : styles.logoutBtnLight]}
              onPress={() => setShowLogoutModal(true)}
            >
              <LogOut size={17} color={isDark ? '#e4e4e7' : '#374151'} strokeWidth={2} />
              <Text style={[styles.logoutBtnText, isDark ? styles.textDark : styles.textLight]}>
                Log Out
              </Text>
            </Pressable>

            <Pressable
              style={[styles.accountBtn, styles.deleteBtn]}
              onPress={() => {
                setDeleteInput('');
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={17} color="#ffffff" strokeWidth={2} />
              <Text style={styles.deleteBtnText}>
                Delete Account
              </Text>
            </Pressable>
          </View>

          {/* ── App Version Footer ── */}
          <Text style={[styles.versionText, isDark ? styles.versionDark : styles.versionLight]}>
            Skin Story · Version 2.0.1 (Build 42)
          </Text>

        </View>
      </ScrollView>

      {/* ── Public Routine Info Modal ── */}
      <Modal
        visible={showPublicModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublicModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPublicModal(false)}
        >
          <Pressable
            style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalIconWrap, isDark ? styles.modalIconWrapDark : styles.modalIconWrapLight]}>
              <CustomClockIcon size={28} color={isDark ? '#a1a1aa' : '#6b7280'} />
            </View>

            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Public Routines
            </Text>

            <Text style={[styles.modalDescription, isDark ? styles.modalDescDark : styles.modalDescLight]}>
              When enabled, custom routines are shared with the community so others with the same skin concern can discover your routine and follow them.
            </Text>

            <Pressable
              style={[styles.modalCloseBtn, { backgroundColor: primary }]}
              onPress={() => setShowPublicModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Yes, I understood</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Log Out Confirmation Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable
            style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Neutral muted icon matching Appearance / Support */}
            <View style={[styles.modalIconWrap, isDark ? styles.modalIconWrapDark : styles.modalIconWrapLight]}>
              <LogOut size={26} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
            </View>

            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Log Out
            </Text>

            <Text style={[styles.modalDescription, isDark ? styles.modalDescDark : styles.modalDescLight]}>
              Do you really want to log out of your account?
            </Text>

            <View style={styles.modalBtnRow}>
              <Pressable
                style={[styles.modalActionBtn, isDark ? styles.cancelBtnDark : styles.cancelBtnLight]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.cancelBtnText, isDark ? styles.textDark : styles.textLight]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalActionBtn, { backgroundColor: primary }]}
                onPress={() => {
                  setShowLogoutModal(false);
                  Alert.alert('Logged Out', 'You have been successfully logged out.');
                }}
              >
                <Text style={styles.confirmBtnText}>Log Out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Delete Account Modal (with Warning & 'delete' input) ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable
            style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalIconWrap, isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' }]}>
              <AlertTriangle size={28} color="#ef4444" strokeWidth={2.2} />
            </View>

            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Delete Account
            </Text>

            <Text style={[styles.modalDescription, isDark ? styles.modalDescDark : styles.modalDescLight]}>
              Are you sure you want to delete? You will lose all your data and your current plan will also be terminated.
            </Text>

            <Text style={[styles.deleteInstruction, isDark ? styles.deleteInstructionDark : styles.deleteInstructionLight]}>
              Type <Text style={{ fontWeight: '700', color: '#ef4444' }}>delete</Text> below to confirm:
            </Text>

            <TextInput
              style={[styles.deleteInput, isDark ? styles.deleteInputDark : styles.deleteInputLight]}
              placeholder="delete"
              placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                style={[styles.modalActionBtn, isDark ? styles.cancelBtnDark : styles.cancelBtnLight]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.cancelBtnText, isDark ? styles.textDark : styles.textLight]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalActionBtn,
                  { backgroundColor: deleteInput.trim().toLowerCase() === 'delete' ? '#ef4444' : (isDark ? '#27272a' : '#e5e7eb') },
                ]}
                disabled={deleteInput.trim().toLowerCase() !== 'delete'}
                onPress={() => {
                  if (deleteInput.trim().toLowerCase() === 'delete') {
                    setShowDeleteModal(false);
                    Alert.alert('Account Deleted', 'Your account and data have been scheduled for deletion.');
                  }
                }}
              >
                <Text style={[styles.confirmBtnText, { color: deleteInput.trim().toLowerCase() === 'delete' ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }]}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {/* ── Support Form Modal (Large Centered Modal with ScrollView) ── */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowSupportModal(false)}
        >
          <Pressable
            style={[styles.largeModalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Header row */}
              <View style={styles.largeModalHeader}>
                <View style={[styles.modalIconWrap, isDark ? styles.modalIconWrapDark : styles.modalIconWrapLight]}>
                  <Headphones size={24} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight, { textAlign: 'left', marginBottom: 2 }]}>
                    Get Support
                  </Text>
                  <Text style={[styles.modalDescTwoLines, isDark ? styles.modalDescDark : styles.modalDescLight]}>
                    Tell us what issue you are facing and{'\n'}our support team will help you promptly.
                  </Text>
                </View>
              </View>

              {/* Name */}
              <Text style={[styles.formFieldLabel, isDark ? styles.textDark : styles.textLight]}>Name</Text>
              <View style={[styles.formFieldCard, isDark ? styles.cardDark : styles.cardLight]}>
                <TextInput
                  style={[styles.formFieldInput, isDark ? styles.inputTextDark : styles.inputTextLight]}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                  value={supportName}
                  onChangeText={setSupportName}
                  autoCorrect={false}
                />
              </View>

              {/* Email */}
              <Text style={[styles.formFieldLabel, isDark ? styles.textDark : styles.textLight, { marginTop: 14 }]}>Email</Text>
              <View style={[styles.formFieldCard, isDark ? styles.cardDark : styles.cardLight]}>
                <TextInput
                  style={[styles.formFieldInput, isDark ? styles.inputTextDark : styles.inputTextLight]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                  value={supportEmail}
                  onChangeText={setSupportEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Message */}
              <Text style={[styles.formFieldLabel, isDark ? styles.textDark : styles.textLight, { marginTop: 14 }]}>Your Message</Text>
              <View style={[styles.formFieldCard, isDark ? styles.cardDark : styles.cardLight]}>
                <TextInput
                  style={[styles.formFieldInput, styles.largeFormMessageInput, isDark ? styles.inputTextDark : styles.inputTextLight]}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                  value={supportIssue}
                  onChangeText={setSupportIssue}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Buttons */}
              <View style={[styles.modalBtnRow, { marginTop: 20 }]}>
                <Pressable
                  style={[styles.modalActionBtn, isDark ? styles.cancelBtnDark : styles.cancelBtnLight]}
                  onPress={() => setShowSupportModal(false)}
                >
                  <Text style={[styles.cancelBtnText, isDark ? styles.textDark : styles.textLight]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: supportIssue.trim().length > 0 ? primary : (isDark ? '#27272a' : '#e5e7eb') },
                  ]}
                  disabled={supportIssue.trim().length === 0}
                  onPress={() => {
                    setShowSupportModal(false);
                    Alert.alert('Request Sent', 'Thank you! Our support team has received your request and will contact you shortly.');
                  }}
                >
                  <Text style={[styles.confirmBtnText, { color: supportIssue.trim().length > 0 ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }]}>
                    Submit
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Give Feedback Modal (Larger size with two-line subtitle & bigger textarea) ── */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowFeedbackModal(false)}
        >
          <Pressable
            style={[styles.largeFeedbackModalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.modalIconWrap, isDark ? styles.modalIconWrapDark : styles.modalIconWrapLight]}>
                  <MessageSquareHeart size={26} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
                </View>

                <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
                  Give Feedback
                </Text>

                <Text style={[styles.modalDescTwoLines, { textAlign: 'center', marginBottom: 18 }, isDark ? styles.modalDescDark : styles.modalDescLight]}>
                  We'd love to know what you think of Skin Story{'\n'}and how we can make your experience even better!
                </Text>
              </View>

              {/* Feedback Description Area (Bigger) */}
              <View style={[styles.formFieldCard, isDark ? styles.cardDark : styles.cardLight]}>
                <TextInput
                  style={[styles.formFieldInput, styles.largeFeedbackTextarea, isDark ? styles.inputTextDark : styles.inputTextLight]}
                  placeholder="Write your suggestions, bugs, or thoughts here..."
                  placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={[styles.modalBtnRow, { marginTop: 20 }]}>
                <Pressable
                  style={[styles.modalActionBtn, isDark ? styles.cancelBtnDark : styles.cancelBtnLight]}
                  onPress={() => setShowFeedbackModal(false)}
                >
                  <Text style={[styles.cancelBtnText, isDark ? styles.textDark : styles.textLight]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalActionBtn,
                    { backgroundColor: feedbackText.trim().length > 0 ? primary : (isDark ? '#27272a' : '#e5e7eb') },
                  ]}
                  disabled={feedbackText.trim().length === 0}
                  onPress={() => {
                    setShowFeedbackModal(false);
                    Alert.alert('Feedback Received', 'Thank you for helping us improve Skin Story!');
                  }}
                >
                  <Text style={[styles.confirmBtnText, { color: feedbackText.trim().length > 0 ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }]}>
                    Submit
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgLight: { backgroundColor: '#f5f5f7' },
  bgDark: { backgroundColor: '#121212' },

  /* Avatar */
  avatarSection: { alignItems: 'center', marginBottom: 4 },
  avatarWrap: {
    width: AVATAR_SIZE + 10,
    height: AVATAR_SIZE + 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3.5,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  editBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: EDIT_SIZE,
    height: EDIT_SIZE,
    borderRadius: EDIT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },

  /* Content */
  content: { paddingTop: 16 },

  /* Section title — matches Appearance style and aligned with text inside cards */
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 16,
    opacity: 0.5,
  },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },

  /* Card */
  card: { borderRadius: 16, overflow: 'hidden' },
  cardLight: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  cardDark: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a' },

  /* Text input inside card */
  fieldInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  inputTextLight: { color: '#111827' },
  inputTextDark: { color: '#ffffff' },

  /* Row (toggle rows) */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  labelWithInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBtn: {
    padding: 2,
  },
  rowText: { fontSize: 15, fontWeight: '500' },

  /* Divider — inset on both sides so it doesn't touch card edges */
  divider: { height: 1, marginHorizontal: 16 },
  dividerLight: { backgroundColor: '#f3f4f6' },
  dividerDark: { backgroundColor: '#27272a' },

  /* Appearance option rows */
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { fontSize: 16, fontWeight: '500' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  radioActive: { borderColor: Colors.light.primary, borderWidth: 6 },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCardLight: {
    backgroundColor: '#ffffff',
  },
  modalCardDark: {
    backgroundColor: '#1f1f23',
    borderWidth: 1,
    borderColor: '#2e2e34',
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalDescLight: {
    color: '#4b5563',
  },
  modalDescDark: {
    color: '#a1a1aa',
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Bottom Account Action Buttons (Side by Side) */
  accountActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  accountBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  logoutBtnLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutBtnDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* App Version Footer */
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 8,
  },
  versionLight: { color: '#9ca3af' },
  versionDark: { color: '#52525b' },

  /* Modal Icon Wraps */
  modalIconWrapLight: {
    backgroundColor: '#f3f4f6',
  },
  modalIconWrapDark: {
    backgroundColor: '#27272a',
  },

  /* Modal Action Rows & Inputs */
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 6,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnLight: {
    backgroundColor: '#f3f4f6',
  },
  cancelBtnDark: {
    backgroundColor: '#27272a',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteInstruction: {
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteInstructionLight: {
    color: '#374151',
  },
  deleteInstructionDark: {
    color: '#e4e4e7',
  },
  deleteInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteInputLight: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  deleteInputDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    color: '#ffffff',
  },

  /* Top Back Button Header */
  topHeader: {
    paddingHorizontal: 0,
    marginBottom: 4,
  },
  topBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  /* Support & Feedback Form Modal Inputs (legacy — kept for feedback modal) */
  formInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  formTextArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 18,
  },

  /* Large Modal Card (Support Form) */
  largeModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '88%',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  largeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  modalDescTwoLines: {
    fontSize: 13,
    lineHeight: 19,
  },

  /* Large Feedback Modal Card */
  largeFeedbackModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  largeFeedbackTextarea: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  /* Profile-style form field labels and cards inside Support & Feedback modals */
  formFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
    marginBottom: 6,
  },
  formFieldCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  formFieldInput: {
    fontSize: 15,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  largeFormMessageInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 13,
  },
});
