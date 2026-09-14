import React from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { Text, ButtonText } from '@/components/AppText';
import Svg, { Circle, Path } from 'react-native-svg';
import { getResponsiveValue } from '@/constants/theme';
import { ZONE_COORDS, ZONES, CONTAINER_WIDTH, CONTAINER_HEIGHT, BOX_WIDTH, BOX_HEIGHT } from './zoneData';

interface FaceZoneMapProps {
  selectedZones: string[];
  onSelectZone: (id: string) => void;
  primaryColor?: string;
  shadowColor?: string;
}

export default function FaceZoneMap({
  selectedZones,
  onSelectZone,
  primaryColor = '#937abd',
  shadowColor = '#735b9c',
}: FaceZoneMapProps) {
  return (
    <View style={styles.interactiveArea}>
      {/* Central Portrait Image */}
      <Image
        source={require('../../../assets/images/question3_avatar.webp')}
        style={styles.avatarImage}
        resizeMode="contain"
      />

      {/* SVG Connector Lines */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {ZONE_COORDS.map((zone) => {
          const isSelected = selectedZones.includes(zone.id);
          const lineColor = isSelected ? '#111111' : '#b0a4c8';
          const dotStroke = isSelected ? primaryColor : '#b0a4c8';
          const dotFill = '#ffffff';

          return (
            <React.Fragment key={zone.id}>
              {/* Dashed connector line */}
              <Path
                d={zone.pathData}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="4, 4"
              />
              {/* Target location dot on face */}
              <Circle
                cx={zone.dotPixelX}
                cy={zone.dotPixelY}
                r="5.5"
                fill={dotFill}
                stroke={dotStroke}
                strokeWidth="2.5"
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Floating Callout Boxes */}
      {ZONES.map((zone) => {
        const isSelected = selectedZones.includes(zone.id);
        const currentBorderColor = isSelected ? primaryColor : '#111111';
        const currentShadowColor = isSelected ? shadowColor : '#111111';

        return (
          <View
            key={zone.id}
            style={[
              styles.calloutWrapper,
              {
                left: zone.boxX * CONTAINER_WIDTH,
                top: zone.boxY * CONTAINER_HEIGHT,
              },
            ]}
          >
            <Pressable
              style={styles.calloutPressable}
              onPress={() => onSelectZone(zone.id)}
            >
              {({ pressed }) => (
                <>
                  <View style={[styles.calloutShadow, { backgroundColor: currentShadowColor }]} />
                  <View
                    style={[
                      styles.calloutTop,
                      {
                        backgroundColor: isSelected ? '#f0ebf8' : '#ffffff',
                        borderColor: currentBorderColor,
                        top: pressed ? 2 : 0,
                        left: pressed ? 2 : 0,
                      },
                    ]}
                  >
                    <ButtonText style={styles.calloutTextOverride}>
                      {zone.name}
                    </ButtonText>
                  </View>
                </>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  interactiveArea: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  calloutWrapper: {
    position: 'absolute',
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    zIndex: 10,
  },
  calloutPressable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  calloutShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    position: 'absolute',
    top: 2.5,
    left: 2.5,
  },
  calloutTop: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    paddingHorizontal: 12,
  },
  calloutTextOverride: {
    color: '#111111',
    textAlign: 'center',
  },
});
