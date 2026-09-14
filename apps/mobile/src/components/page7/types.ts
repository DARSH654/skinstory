export type ConnectionType = 
  | 'side'
  | 'bottom-center-elbow'
  | 'bottom-center-straight'
  | 'top-center-elbow'
  | 'vertical-then-horizontal'
  | 'straight';

export interface Zone {
  id: string;
  name: string;
  dotX: number;
  dotY: number;
  boxX: number;
  boxY: number;
  align: 'left' | 'right';
  elbowX?: number;
  connectionType?: ConnectionType;
}

export interface ZoneCoord extends Zone {
  dotPixelX: number;
  dotPixelY: number;
  boxPixelX: number;
  boxPixelY: number;
  pathData: string;
}

export interface ZoneFollowUpData {
  title: string;
  subtitle: string;
  options: string[];
}
