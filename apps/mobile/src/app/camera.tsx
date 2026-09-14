import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Image,
} from 'react-native';
import { Text } from '@/components/AppText';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import {
  X,
  Zap,
  ZapOff,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, Mask, Rect, Path } from 'react-native-svg';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useScanStore } from '@/store/scanStore';
import { Colors } from '@/constants/theme';

export default function CameraScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const howToSheetRef = useRef<BottomSheetModal>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);

  // Capture outward zoom / expand animation & continue button entrance
  const captureAnim = useRef(new Animated.Value(0)).current;
  const continueBtnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const toggleFlash = () => {
    setIsFlashOn((prev) => !prev);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedPhotoUri(asset.uri);
        setIsCaptured(true);

        Animated.parallel([
          Animated.timing(captureAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(continueBtnAnim, {
            toValue: 1,
            friction: 7,
            tension: 65,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch {
      // ignore
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);

    // Click feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    try {
      // 1. Take picture first
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedPhotoUri(photo.uri);
        setIsCaptured(true);

        // 2. AFTER clicking image, expand the frame outwards and reveal Continue button
        Animated.parallel([
          Animated.timing(captureAnim, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.spring(continueBtnAnim, {
            toValue: 1,
            friction: 7,
            tension: 65,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch {
      setIsCapturing(false);
      captureAnim.setValue(0);
      continueBtnAnim.setValue(0);
    }
  };

  const handleContinue = () => {
    if (!capturedPhotoUri) return;
    useScanStore.getState().setImage(capturedPhotoUri);
    useScanStore.getState().runAnalysis();
    router.replace('/scan/1');
  };

  const openHowToSheet = () => {
    howToSheetRef.current?.present();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  // Layout calculations for face scanning frame
  const FRAME_WIDTH = SCREEN_WIDTH * 0.88;
  const FRAME_X = (SCREEN_WIDTH - FRAME_WIDTH) / 2;
  const FRAME_Y = Math.max(insets.top, 16) + 62;
  const BOTTOM_RESERVE = Math.max(insets.bottom + 16, 28) + 90;
  const FRAME_HEIGHT = SCREEN_HEIGHT - FRAME_Y - BOTTOM_RESERVE;
  const CORNER_RADIUS = 32;
  const CORNER_LENGTH = 52;

  // SVG paths for corner brackets
  const tlPath = `M ${FRAME_X} ${FRAME_Y + CORNER_LENGTH} L ${FRAME_X} ${
    FRAME_Y + CORNER_RADIUS
  } A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${
    FRAME_X + CORNER_RADIUS
  } ${FRAME_Y} L ${FRAME_X + CORNER_LENGTH} ${FRAME_Y}`;

  const trPath = `M ${FRAME_X + FRAME_WIDTH - CORNER_LENGTH} ${FRAME_Y} L ${
    FRAME_X + FRAME_WIDTH - CORNER_RADIUS
  } ${FRAME_Y} A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${
    FRAME_X + FRAME_WIDTH
  } ${FRAME_Y + CORNER_RADIUS} L ${FRAME_X + FRAME_WIDTH} ${
    FRAME_Y + CORNER_LENGTH
  }`;

  const blPath = `M ${FRAME_X} ${
    FRAME_Y + FRAME_HEIGHT - CORNER_LENGTH
  } L ${FRAME_X} ${
    FRAME_Y + FRAME_HEIGHT - CORNER_RADIUS
  } A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${
    FRAME_X + CORNER_RADIUS
  } ${FRAME_Y + FRAME_HEIGHT} L ${FRAME_X + CORNER_LENGTH} ${
    FRAME_Y + FRAME_HEIGHT
  }`;

  const brPath = `M ${FRAME_X + FRAME_WIDTH - CORNER_LENGTH} ${
    FRAME_Y + FRAME_HEIGHT
  } L ${FRAME_X + FRAME_WIDTH - CORNER_RADIUS} ${
    FRAME_Y + FRAME_HEIGHT
  } A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${FRAME_X + FRAME_WIDTH} ${
    FRAME_Y + FRAME_HEIGHT - CORNER_RADIUS
  } L ${FRAME_X + FRAME_WIDTH} ${FRAME_Y + FRAME_HEIGHT - CORNER_LENGTH}`;

  // Animation style interpolations
  const topBarAnimatedStyle = {
    opacity: captureAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateY: captureAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
  };

  const bottomControlsAnimatedStyle = {
    opacity: captureAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateY: captureAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 90],
        }),
      },
    ],
  };

  const frameOverlayAnimatedStyle = {
    opacity: captureAnim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [1, 0.5, 0],
    }),
    transform: [
      {
        scale: captureAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.38],
        }),
      },
    ],
  };

  // Permission denied state
  if (permission && !permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Camera Permission Required</Text>
        <Text style={styles.errorSubtitle}>
          We need camera access to analyze your skin. Please enable it in your
          phone Settings.
        </Text>
        <Pressable style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Permission loading state
  if (!permission) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhotoUri ? (
        <Image
          source={{ uri: capturedPhotoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          mode="picture"
          onCameraReady={() => setIsCameraReady(true)}
        />
      )}

      {/* Dimmed Background Overlay with Transparent Cutout & Corner Brackets (Animated Expand on Capture) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, frameOverlayAnimatedStyle]}
        pointerEvents="none"
      >
        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <Mask id="scanCutoutMask">
              <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="#ffffff" />
              <Rect
                x={FRAME_X}
                y={FRAME_Y}
                width={FRAME_WIDTH}
                height={FRAME_HEIGHT}
                rx={CORNER_RADIUS}
                ry={CORNER_RADIUS}
                fill="#000000"
              />
            </Mask>
          </Defs>

          {/* Dimmed Mask outside the frame */}
          <Rect
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="rgba(0, 0, 0, 0.42)"
            mask="url(#scanCutoutMask)"
          />

          {/* 4 Corner Bracket Outlines in White */}
          <Path
            d={tlPath}
            stroke="#ffffff"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={trPath}
            stroke="#ffffff"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={blPath}
            stroke="#ffffff"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={brPath}
            stroke="#ffffff"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* Top Header Bar (Animated Outward on Capture) */}
      <Animated.View
        style={[
          styles.topBar,
          { top: Math.max(insets.top, 16) + 4 },
          topBarAnimatedStyle,
        ]}
        pointerEvents={isCaptured ? 'none' : 'auto'}
      >
        {/* Flash Toggle: Unselected (ZapOff) vs Selected (Zap), clean white icon */}
        <Pressable
          style={styles.topIconButton}
          onPress={toggleFlash}
          hitSlop={10}
          accessibilityLabel="Toggle Flash"
        >
          {isFlashOn ? (
            <Zap size={22} color="#ffffff" strokeWidth={2.2} />
          ) : (
            <ZapOff size={22} color="#ffffff" strokeWidth={2.2} />
          )}
        </Pressable>

        {/* 2 scans left pill */}
        <View style={styles.scansLeftBadge}>
          <Text style={styles.scansLeftText}>2 scans left</Text>
        </View>

        {/* Top-Right Close Button */}
        <Pressable
          style={styles.topIconButton}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Close Camera"
        >
          <X size={22} color="#ffffff" strokeWidth={2.4} />
        </Pressable>
      </Animated.View>

      {/* Bottom Controls Bar (Animated Outward on Capture) */}
      {!isCaptured && (
        <Animated.View
          style={[
            styles.bottomControls,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
            bottomControlsAnimatedStyle,
          ]}
        >
          {/* Gallery Picker (Transparent background) */}
          <Pressable
            style={styles.galleryButton}
            onPress={handlePickImage}
            accessibilityLabel="Open Gallery"
            hitSlop={14}
          >
            <ImageIcon size={34} color="#ffffff" strokeWidth={1.8} />
          </Pressable>

          {/* Circular Shutter Button */}
          <Pressable
            style={[
              styles.shutterButtonOuter,
              (!isCameraReady || isCapturing) && { opacity: 0.65 },
            ]}
            onPress={handleTakePhoto}
            disabled={!isCameraReady || isCapturing}
            accessibilityLabel="Capture Photo"
          >
            <View style={styles.shutterButtonInner}>
              {isCapturing ? (
                <ActivityIndicator color={Colors.light.primary} size="small" />
              ) : null}
            </View>
          </Pressable>

          {/* How To Button */}
          <Pressable
            style={styles.howToButton}
            onPress={openHowToSheet}
            accessibilityLabel="How To Guide"
            hitSlop={14}
          >
            <HelpCircle size={28} color="#ffffff" strokeWidth={2.2} />
            <Text style={styles.howToText}>How To</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Continue Button (Revealed after Capture & Expansion) */}
      {isCaptured && (
        <Animated.View
          style={[
            styles.continueContainer,
            {
              paddingBottom: Math.max(insets.bottom + 16, 28),
              opacity: continueBtnAnim,
              transform: [
                {
                  translateY: continueBtnAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            accessibilityLabel="Continue to Skin Analysis"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2.4} />
          </Pressable>
        </Animated.View>
      )}

      {/* How-To Bottom Sheet Modal (Routine-Style Slide) */}
      <BottomSheetModal
        ref={howToSheetRef}
        enableDynamicSizing
        enablePanDownToClose
        bottomInset={insets.bottom}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.sheetDragHandle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <Sparkles size={20} color="#937abd" />
              <Text style={styles.sheetTitle}>How to take a scan</Text>
            </View>
          </View>

          <View style={styles.instructionList}>
            <View style={styles.instructionRow}>
              <View style={styles.instructionDot}>
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </View>
              <Text style={styles.instructionText}>
                Position your face inside the white corner guide brackets.
              </Text>
            </View>

            <View style={styles.instructionRow}>
              <View style={styles.instructionDot}>
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </View>
              <Text style={styles.instructionText}>
                Ensure bright, even lighting with no harsh shadows on your skin.
              </Text>
            </View>

            <View style={styles.instructionRow}>
              <View style={styles.instructionDot}>
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </View>
              <Text style={styles.instructionText}>
                Keep a neutral facial expression and remove glasses or hats.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.sheetGotItButton}
            onPress={() => howToSheetRef.current?.dismiss()}
          >
            <Text style={styles.sheetGotItText}>Got It</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  topIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scansLeftBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  scansLeftText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 28,
    zIndex: 50,
  },
  galleryButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  howToButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  howToText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shutterButtonOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetBackground: {
    backgroundColor: '#1c1924',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetDragHandle: {
    backgroundColor: '#52525b',
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sheetHeader: {
    marginBottom: 18,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
  },
  instructionList: {
    gap: 14,
    marginBottom: 24,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#937abd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  sheetGotItButton: {
    backgroundColor: '#937abd',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetGotItText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    zIndex: 60,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 100,
    gap: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
