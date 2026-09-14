import React from 'react';
import Svg, { Path, Rect, SvgProps, G } from 'react-native-svg';

export const CustomClockIcon = ({
  color,
  size = 24,
  ...props
}: SvgProps & { color: string; fill?: string; innerColor?: string; size?: number; strokeWidth?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    {...props}
  >
    <Path d="M567-364.5Q630-328 702-308q-40 51-98 79.5T481-200q-117 0-198.5-81.5T201-480q0-65 28.5-123t79.5-98q20 72 56.5 135T453-452q51 51 114 87.5ZM743-380q-20-5-39.5-11T665-405q8-18 11.5-36.5T680-480q0-83-58.5-141.5T480-680q-20 0-38.5 3.5T405-665q-8-19-13.5-38T381-742q24-9 49-13.5t51-4.5q117 0 198.5 81.5T761-480q0 26-4.5 51T743-380ZM440-840v-120h80v120h-80Zm0 840v-120h80V0h-80Zm323-706-57-57 85-84 57 56-85 85ZM169-113l-57-56 85-85 57 57-85 84Zm671-327v-80h120v80H840ZM0-440v-80h120v80H0Zm791 328-85-85 57-57 84 85-56 57ZM197-706l-84-85 56-57 85 85-57 57Zm199 310Z" fill={color} />
  </Svg>
);

export const CustomHomeIcon = ({
  color,
  size = 24,
  ...props
}: SvgProps & { color: string; size?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 427 396"
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <G transform="translate(0, 413) scale(0.1, -0.1)" fill={color} stroke="none">
      <Path d="M2100 3713 c-28 -19 -146 -131 -1001 -944 -327 -311 -606 -580 -621 -598 -60 -71 -41 -148 59 -243 117 -111 134 -105 376 126 106 100 318 301 472 446 154 145 387 365 518 489 132 125 248 227 259 229 21 4 28 -2 293 -253 94 -89 303 -287 465 -440 162 -153 378 -358 478 -454 101 -97 198 -184 215 -193 61 -34 104 -21 189 60 71 67 101 124 91 173 -8 45 -136 171 -858 855 -887 839 -802 764 -863 764 -29 0 -57 -7 -72 -17z"/>
      <Path d="M2134 3008 c-16 -13 -137 -124 -269 -247 -634 -594 -898 -847 -906 -868 -5 -14 -9 -292 -9 -631 0 -580 1 -609 20 -650 32 -71 37 -72 443 -72 330 0 355 1 370 18 15 17 17 65 17 486 l0 468 29 29 29 29 307 0 c342 0 346 -1 365 -69 6 -22 10 -214 10 -488 0 -437 1 -453 19 -463 13 -6 146 -10 366 -10 375 0 392 2 433 55 l22 28 0 637 0 638 -227 214 c-724 682 -955 897 -974 908 -12 7 -25 4 -45 -12z"/>
    </G>
  </Svg>
);

export const CustomProgressIcon = ({
  color,
  size = 24,
  ...props
}: SvgProps & { color: string; size?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    {/* Rectangular bars with slightly rounded corners (not fully round capsules) */}
    <Rect x="4" y="9" width="4" height="12" rx="1" fill={color} />
    <Rect x="10" y="4" width="4" height="17" rx="1" fill={color} />
    <Rect x="16" y="13" width="4" height="8" rx="1" fill={color} />
  </Svg>
);
