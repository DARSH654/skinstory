import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  BackHandler,
  ImageBackground,
  Image
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Clipboard from 'expo-clipboard';
import { Search, SlidersHorizontal, Plus, Copy, Eye, EyeOff, Pencil, Trash2, Droplet, FlaskConical, Leaf } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { CustomClockIcon } from '@/components/custom-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Header from '@/components/layout/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocusEffect } from 'expo-router';
import { DraggableScrollDownCircle, useDraggableScroll } from '@/components/ui/draggable-scroll-down-circle';
import LottieView from 'lottie-react-native';
import EnterRoutineCodeSheet, { EnterRoutineCodeSheetRef } from '@/components/routine/EnterRoutineCodeSheet';
import RoutineFilterModal from '@/components/routine/RoutineFilterModal';
import RoutineDeleteModal from '@/components/routine/RoutineDeleteModal';
import RoutineCard from '@/components/routine/RoutineCard';

const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
};

const getSimilarityScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 100;
  
  const qChars = q.split('');
  let matchCount = 0;
  let tTemp = t;
  qChars.forEach(char => {
    if (tTemp.includes(char)) {
      matchCount++;
      tTemp = tTemp.replace(char, '');
    }
  });
  
  const overlapScore = q.length > 0 ? (matchCount / q.length) * 60 : 0; 
  
  const dist = levenshtein(q, t);
  const maxLength = Math.max(q.length, t.length);
  const levScore = maxLength > 0 ? ((maxLength - dist) / maxLength) * 40 : 0;
  
  return overlapScore + levScore;
};

const getRoutineImage = (routine: any) => {
  if (routine.coverImage) return { uri: routine.coverImage };
  if (routine.image) return { uri: routine.image };
  if (routine.productImage) return { uri: routine.productImage };
  if (routine.stepData) {
    for (const key of Object.keys(routine.stepData)) {
      if (routine.stepData[key]?.productImage) {
        return { uri: routine.stepData[key].productImage };
      }
    }
  }
  return require('../../../assets/images/routine_placeholder.jpg');
};

const getRoutineSubtitle = (routine: any) => {
  if (routine.description && routine.description.trim()) return routine.description.trim();
  if (routine.subtitle && routine.subtitle.trim()) return routine.subtitle.trim();
  if (routine.stepData) {
    for (const key of Object.keys(routine.stepData)) {
      const step = routine.stepData[key];
      if (step?.actionDesc && step.actionDesc.trim()) return step.actionDesc.trim();
      if (step?.productDesc && step.productDesc.trim()) return step.productDesc.trim();
    }
  }
  return "My go-to sequence for deeply nourishing dry winter skin. Focuses on layering...";
};

export default function RoutineScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [routines, setRoutines] = useState<any[]>([]);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const fabMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fabMenuOpen) {
      Animated.spring(fabMenuAnim, {
        toValue: 1,
        friction: 6,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabMenuAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [fabMenuOpen]);

  // ScrollView tracking for main page to show/hide the scroll down circle
  const mainScrollViewRef = useRef<ScrollView>(null);
  const { scrollHandlers: mainScrollHandlers, isSaveBtnVisible: isMainSaveBtnVisible } = useDraggableScroll({
    modalOpen: true,
    activeStep: null,
    scrollViewRef: mainScrollViewRef,
    shouldScrollToTop: false,
  });

  const [userProfile, setUserProfile] = useState<{ name: string; avatarUri: string | null } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const stored = await AsyncStorage.getItem('routines');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.sort((a: any, b: any) => {
              const timeA = new Date(a.createdAt || a.updatedAt || parseInt(a.id) || 0).getTime();
              const timeB = new Date(b.createdAt || b.updatedAt || parseInt(b.id) || 0).getTime();
              return timeB - timeA;
            });
            setRoutines(parsed);
          }
          const storedProfile = await AsyncStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (e) {
          console.error("Failed to load routines or profile", e);
        }
      };
      loadData();
    }, [])
  );

  const [hiddenCodes, setHiddenCodes] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleCodeVisibility = (routineId: string) => {
    setHiddenCodes(prev => ({ ...prev, [routineId]: !prev[routineId] }));
  };

  const addCodeSheetRef = useRef<EnterRoutineCodeSheetRef>(null);
  const [isAddCodeSheetOpen, setIsAddCodeSheetOpen] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAddCodeSheetOpen) {
        addCodeSheetRef.current?.dismiss();
        return true; // block navigation
      }
      return false; // let system handle
    });
    return () => sub.remove();
  }, [isAddCodeSheetOpen]);
  
  // Toast State — two separate toasts
  // 1. Error toast: lives INSIDE the modal (above blur), for "Enter a 6-digit code"
  const [toastMessage, setToastMessage] = useState("");
  const toastSlideAnim = React.useRef(new Animated.Value(-80)).current;
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2. Success toast: lives OUTSIDE the modal in root View, persists after slide closes
  const [successToastMessage, setSuccessToastMessage] = useState("");
  const successToastSlideAnim = React.useRef(new Animated.Value(-80)).current;
  const successToastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastSlideAnim.stopAnimation();
    toastSlideAnim.setValue(-80);
    setToastMessage(msg);
    Animated.spring(toastSlideAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start(() => {
      toastTimerRef.current = setTimeout(() => {
        Animated.timing(toastSlideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setToastMessage("");
          toastTimerRef.current = null;
        });
      }, 3000);
    });
  };

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  const showSuccessToast = (msg: string) => {
    // trigger animation and toast in parallel
    setShowSuccessAnimation(true);

    if (successToastTimerRef.current) {
      clearTimeout(successToastTimerRef.current);
      successToastTimerRef.current = null;
    }
    successToastSlideAnim.stopAnimation();
    successToastSlideAnim.setValue(-80);
    setSuccessToastMessage(msg);
    Animated.spring(successToastSlideAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start(() => {
      // Fallback timer matching exact Lottie duration (126 frames @ 25fps = ~5040ms)
      successToastTimerRef.current = setTimeout(() => {
        dismissSuccessToast();
      }, 5040);
    });
  };

  // Swipe-up-to-dismiss for error toast
  const dismissErrorToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    Animated.timing(toastSlideAnim, {
      toValue: -80,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setToastMessage("");
    });
  };

  const errorToastPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) {
          toastSlideAnim.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -20) {
          dismissErrorToast();
        } else {
          Animated.spring(toastSlideAnim, {
            toValue: 0,
            damping: 20,
            stiffness: 200,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Swipe-up-to-dismiss for success toast
  const dismissSuccessToast = () => {
    if (successToastTimerRef.current) {
      clearTimeout(successToastTimerRef.current);
      successToastTimerRef.current = null;
    }
    Animated.timing(successToastSlideAnim, {
      toValue: -80,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSuccessToastMessage("");
    });
  };

  const successToastPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) {
          successToastSlideAnim.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -20) {
          dismissSuccessToast();
        } else {
          Animated.spring(successToastSlideAnim, {
            toValue: 0,
            damping: 20,
            stiffness: 200,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<any>(null);

  const handleDeleteClick = (routine: any) => {
    setRoutineToDelete(routine);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (routineToDelete) {
      const newRoutines = routines.filter((r: any) => r.id !== routineToDelete.id);
      setRoutines(newRoutines);
      try {
        await AsyncStorage.setItem('routines', JSON.stringify(newRoutines));
      } catch (e) {
        console.error("Failed to delete routine", e);
      }
    }
    setDeleteConfirmOpen(false);
    setRoutineToDelete(null);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMinSteps, setFilterMinSteps] = useState("");
  const [filterMinDos, setFilterMinDos] = useState("");
  const [filterMinDonts, setFilterMinDonts] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{ steps: number | null; dos: number | null; donts: number | null }>({ steps: null, dos: null, donts: null });

  // Clear button: enabled only when there are actually applied filters
  const isFilterApplied = appliedFilters.steps !== null || appliedFilters.dos !== null || appliedFilters.donts !== null;

  // Apply button: enabled only when current inputs differ from what's already applied
  const appliedStepsStr = appliedFilters.steps !== null ? appliedFilters.steps.toString() : '';
  const appliedDosStr = appliedFilters.dos !== null ? appliedFilters.dos.toString() : '';
  const appliedDontsStr = appliedFilters.donts !== null ? appliedFilters.donts.toString() : '';
  const hasChanges = (
    filterMinSteps !== appliedStepsStr ||
    filterMinDos !== appliedDosStr ||
    filterMinDonts !== appliedDontsStr
  );

  let emptyStateMessage = "Adjust your search to find relevant results";
  if (isFilterApplied && searchQuery.trim().length > 0) {
    emptyStateMessage = "Adjust your search and filters to find relevant results";
  } else if (isFilterApplied) {
    emptyStateMessage = "Adjust your filters to find relevant results";
  }

  // When filter modal opens, sync inputs to currently applied values
  const openFilter = () => {
    setFilterMinSteps(appliedStepsStr);
    setFilterMinDos(appliedDosStr);
    setFilterMinDonts(appliedDontsStr);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    const newFilters = {
      steps: filterMinSteps === "" ? null : parseInt(filterMinSteps),
      dos: filterMinDos === "" ? null : parseInt(filterMinDos),
      donts: filterMinDonts === "" ? null : parseInt(filterMinDonts),
    };
    setAppliedFilters(newFilters);
    setFilterOpen(false);
  };

  // Auto-clear applied filters when all inputs are emptied
  React.useEffect(() => {
    if (filterMinSteps === "" && filterMinDos === "" && filterMinDonts === "" && isFilterApplied) {
      setAppliedFilters({ steps: null, dos: null, donts: null });
    }
  }, [filterMinSteps, filterMinDos, filterMinDonts]);

  const filteredRoutines = React.useMemo(() => {
    let result = [...routines];

    if (appliedFilters.steps !== null) {
      result = result.filter((r: any) => (r.stepsCount || 0) >= appliedFilters.steps!);
    }
    if (appliedFilters.dos !== null) {
      result = result.filter((r: any) => (r.dosCount || 0) >= appliedFilters.dos!);
    }
    if (appliedFilters.donts !== null) {
      result = result.filter((r: any) => (r.dontsCount || 0) >= appliedFilters.donts!);
    }

    if (searchQuery.trim().length > 0) {
      result = result.map((r: any) => ({
        ...r,
        searchScore: getSimilarityScore(searchQuery.trim(), r.title || '')
      }))
      .filter((r: any) => r.searchScore >= 40)
      .sort((a: any, b: any) => b.searchScore - a.searchScore);
    }
    return result;
  }, [routines, searchQuery, appliedFilters]);

  const resetFilters = () => {
    setFilterMinSteps("");
    setFilterMinDos("");
    setFilterMinDonts("");
    setAppliedFilters({ steps: null, dos: null, donts: null });
  };

  const handleStepsChange = (val: string) => {
    if (val === '') { setFilterMinSteps(''); return; }
    const num = parseInt(val);
    if (!isNaN(num)) setFilterMinSteps(num > 999 ? '999' : num.toString());
  };

  const handleDosChange = (val: string) => {
    if (val === '') { setFilterMinDos(''); return; }
    const num = parseInt(val);
    if (!isNaN(num)) setFilterMinDos(num > 999 ? '999' : num.toString());
  };

  const handleDontsChange = (val: string) => {
    if (val === '') { setFilterMinDonts(''); return; }
    const num = parseInt(val);
    if (!isNaN(num)) setFilterMinDonts(num > 999 ? '999' : num.toString());
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView 
        ref={mainScrollViewRef} 
        style={styles.container} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        {...mainScrollHandlers}
      >
        <Header title="Routines" />
        
        <View style={styles.content}>
          {routines.length > 0 ? (
            <>
              {/* Search Bar Container */}
              <View style={[styles.searchContainer, isDark ? styles.searchBgDark : styles.searchBgLight]}>
                <Search size={20} color={isDark ? "#71717a" : "#9ca3af"} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, isDark ? styles.textDark : styles.textLight]}
                  placeholder="Search routines..."
                  placeholderTextColor={isDark ? "#71717a" : "#9ca3af"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <Pressable 
                  onPress={openFilter} 
                  style={({ pressed }) => [
                    styles.filterBtn,
                    isFilterApplied 
                      ? { backgroundColor: Colors.light.primary } 
                      : (pressed ? (isDark ? { backgroundColor: '#27272a' } : { backgroundColor: '#f3f4f6' }) : null)
                  ]}
                >
                  <SlidersHorizontal size={18} color={isFilterApplied ? "#ffffff" : (isDark ? "#71717a" : "#9ca3af")} />
                </Pressable>
              </View>

              {filteredRoutines.length > 0 ? (
                <View style={styles.routineList}>
                  {filteredRoutines.map((routine: any) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isDark={isDark}
                      userProfile={userProfile}
                      copiedId={copiedId}
                      onCopyCode={handleCopyCode}
                      onEdit={() => router.push(`/routine/create?edit=${routine.id}`)}
                      onDelete={() => handleDeleteClick(routine)}
                      onPress={() => router.push(`/routine/${routine.id}`)}
                      onStartRoutine={() => router.push(`/routine/start?id=${routine.id}`)}
                    />
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyState, { marginTop: 100, flex: 0 }]}>
                   <View style={[styles.emptyIconBg, isDark ? styles.iconBgDark : styles.iconBgLight]}>
                      <Search size={72} color={isDark ? "#52525b" : "#d1d5db"} strokeWidth={2.5} />
                   </View>
                   <Text style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}>
                      No result found
                   </Text>
                   <Text style={[styles.emptySubtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
                      {emptyStateMessage}
                   </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
               <CustomClockIcon size={96} color={isDark ? "#52525b" : "#d1d5db"} style={styles.emptyIcon} />
               <Text style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}>
                  No routine added yet
               </Text>
               <Text style={[styles.emptySubtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
                  {"Build your routines and track your progress,\nstay consistent & achieve your goals."}
               </Text>
               <Pressable style={styles.createBtn} onPress={() => router.push('/routine/create')}>
                 <Plus size={15} color="#fff" />
                 <Text style={styles.createBtnText}>Create Routine</Text>
               </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Main Page Draggable Scroll-Down Circle */}
      <DraggableScrollDownCircle
        scrollViewRef={mainScrollViewRef}
        isSaveBtnVisible={isMainSaveBtnVisible}
        modalOpen={true}
        isDark={isDark}
        isFullScreenModal={false}
      />

      {/* Delete Confirmation Modal */}
      <RoutineDeleteModal
        visible={deleteConfirmOpen}
        isDark={isDark}
        onClose={() => setDeleteConfirmOpen(false)}
        onDelete={executeDelete}
      />

      {/* Filter Modal */}
      <RoutineFilterModal
        visible={filterOpen}
        isDark={isDark}
        filterMinSteps={filterMinSteps}
        filterMinDos={filterMinDos}
        filterMinDonts={filterMinDonts}
        hasChanges={hasChanges}
        hasAnyApplied={isFilterApplied}
        onClose={() => setFilterOpen(false)}
        onStepsChange={handleStepsChange}
        onDosChange={handleDosChange}
        onDontsChange={handleDontsChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {showSuccessAnimation && (
        <View style={styles.lottieOverlay} pointerEvents="none">
          <LottieView
            ref={lottieRef}
            source={require('../../../assets/animations/success_line.json')}
            autoPlay
            loop={false}
            resizeMode="cover"
            style={styles.lottieAnim}
            onAnimationFinish={() => {
              setShowSuccessAnimation(false);
              dismissSuccessToast();
            }}
          />
        </View>
      )}

      {/* Success Toast — OUTSIDE modal so it persists after slide closes */}
      {successToastMessage ? (
        <Animated.View
          {...successToastPanResponder.panHandlers}
          style={[
            styles.toastContainer,
            isDark ? styles.toastDark : styles.toastLight,
            {
              transform: [{ translateY: successToastSlideAnim }],
              top: Math.max(insets.top, 16) + 10,
            }
          ]}
        >
          <Text style={isDark ? styles.toastTextDark : styles.toastTextLight}>
            {successToastMessage}
          </Text>
        </Animated.View>
      ) : null}

      {/* Add Code Bottom Sheet Component */}
      <EnterRoutineCodeSheet
        ref={addCodeSheetRef}
        isDark={isDark}
        onSuccess={(msg) => showSuccessToast(msg)}
        onDismiss={() => setIsAddCodeSheetOpen(false)}
      />

      {/* FAB dismiss backdrop — transparent, closes the menu on outside tap */}
      {fabMenuOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setFabMenuOpen(false)}
        />
      )}

      {/* Floating Action Button (FAB) and Separate Floating Menu Boxes */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        {fabMenuOpen && (
          <View style={styles.fabMenuContainer}>
            {/* Box 1: Create Routine */}
            <Animated.View
              style={[
                styles.fabFloatingBox,
                isDark ? styles.fabBoxDark : styles.fabBoxLight,
                {
                  opacity: fabMenuAnim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 0.2, 1],
                  }),
                  transform: [
                    {
                      translateY: fabMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      scale: fabMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable 
                style={({ pressed }) => [
                  styles.fabMenuItemPressable,
                  pressed && (isDark ? { backgroundColor: '#27272a' } : { backgroundColor: '#f3f4f6' }),
                ]}
                onPress={() => {
                  setFabMenuOpen(false);
                  router.push('/routine/create');
                }}
              >
                <Plus size={16} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.5} />
                <Text style={[styles.fabMenuText, isDark ? styles.textDark : styles.textLight]}>Create Routine</Text>
              </Pressable>
            </Animated.View>

            {/* Box 2: Add Code */}
            <Animated.View
              style={[
                styles.fabFloatingBox,
                isDark ? styles.fabBoxDark : styles.fabBoxLight,
                {
                  opacity: fabMenuAnim.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [0, 0.4, 1],
                  }),
                  transform: [
                    {
                      translateY: fabMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 0],
                      }),
                    },
                    {
                      scale: fabMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable 
                style={({ pressed }) => [
                  styles.fabMenuItemPressable,
                  pressed && (isDark ? { backgroundColor: '#27272a' } : { backgroundColor: '#f3f4f6' }),
                ]}
                onPress={() => {
                  setFabMenuOpen(false);
                  setIsAddCodeSheetOpen(true);
                  addCodeSheetRef.current?.present();
                }}
              >
                <Plus size={16} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.5} />
                <Text style={[styles.fabMenuText, isDark ? styles.textDark : styles.textLight]}>Add Code</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
        <Pressable 
          style={[styles.fabButton, { backgroundColor: Colors.light.primary }]}
          onPress={() => setFabMenuOpen(!fabMenuOpen)}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: fabMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2.5} />
          </Animated.View>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLight: { backgroundColor: '#f5f5f7' },
  bgDark: { backgroundColor: '#121212' },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    zIndex: 10,
  },
  searchBgLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  searchBgDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  filterBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 8,
  },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  subtextLight: { color: '#6b7280' },
  subtextDark: { color: '#a1a1aa' },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    paddingHorizontal: 0,
  },
  emptyIcon: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  emptyIconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconBgLight: { backgroundColor: '#f9fafb' },
  iconBgDark: { backgroundColor: '#18181b' },
  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    marginBottom: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
    alignSelf: 'stretch',
    paddingHorizontal: 32,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 13,
    gap: 7,
    marginTop: 0,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Outfit_600SemiBold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  createBtnMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: 12,
    gap: 6,
  },
  createBtnMainText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  addCodeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  addCodeBtnLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  addCodeBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  addCodeBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  routineList: {
    flex: 1,
    marginTop: 16,
  },
  routineCardOuter: {
    borderRadius: 22,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImageBg: {
    width: '100%',
  },
  cardImageStyle: {
    borderRadius: 22,
    resizeMode: 'cover',
  },
  cardGradientOverlay: {
    padding: 16,
    borderRadius: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    paddingRight: 12,
    borderRadius: 20,
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  authorNameText: {
    color: '#2d3748',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  stepsPill: {
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  stepsPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'Outfit_700Bold',
  },
  cardMiddleSection: {
    marginBottom: 2,
  },
  cardRoutineTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Outfit_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDividerLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 10,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineCodePillBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  routineCodeBottomText: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: 'Outfit_700Bold',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardBareActionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // Removed dark background
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    top: 130,
    right: 16,
    width: 200,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    // shadow
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  deleteModalDesc: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBgLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  modalBgDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  modalTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterInput: {
    width: 60,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    paddingLeft: 4,
    paddingRight: 8,
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputBgLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  inputBgDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: Colors.light.primary,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetKeyboard: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheetContent: {
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.15)',
    elevation: 20,
    overflow: 'hidden',
  },
  sheetDragHandleContainer: {
    width: '100%',
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  sheetDragHandle: {
    width: 56,
    height: 6,
    borderRadius: 3,
  },
  dragHandleLight: {
    backgroundColor: '#d1d5db',
  },
  dragHandleDark: {
    backgroundColor: '#3f3f46',
  },
  sheetInner: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  sheetInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sheetInputLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  sheetInputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBtnCancelLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sheetBtnCancelDark: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  sheetBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetBtnEnter: {
    backgroundColor: Colors.light.primary,
  },
  sheetBtnEnterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
    elevation: 10,
    borderWidth: 1,
    zIndex: 9999,
  },
  toastLight: { backgroundColor: '#111827', borderColor: '#374151' },
  toastDark: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  toastTextLight: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#ffffff' },
  toastTextDark: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#111827' },

  // ── FAB (Floating Action Button) ──────────────────────────────────────────
  fabWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  fabMenuContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 10,
  },
  fabFloatingBox: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  fabBoxLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  fabBoxDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#27272a',
  },
  fabMenuItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 10,
  },
  fabMenuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lottieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    pointerEvents: 'none',
  },
  lottieAnim: {
    width: '100%',
    height: '100%',
  },
  modalToastOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
