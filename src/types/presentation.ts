export type ElementType = 
  | 'text' 
  | 'shape' 
  | 'image' 
  | 'table' 
  | 'chart' 
  | 'smartart' 
  | 'wordart' 
  | 'video' 
  | 'audio' 
  | 'link'
  | 'cameo';

export type ShapeType = 
  | 'rect' 
  | 'rounded-rect' 
  | 'circle' 
  | 'triangle' 
  | 'arrow-right' 
  | 'arrow-double' 
  | 'star' 
  | 'speech-bubble' 
  | 'heart' 
  | 'diamond' 
  | 'cloud' 
  | 'line'
  | 'cylinder';

export type TransitionType = 'none' | 'fade' | 'push' | 'wipe' | 'zoom' | 'flip';

export type ElementAnimationType = 'none' | 'appear' | 'fade-in' | 'fly-in' | 'zoom-in';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // percentage of slide width (0 to 100) or pixels
  y: number; // percentage of slide height (0 to 100)
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  animation?: ElementAnimationType;
  animationOrder?: number; // Thứ tự chạy hiệu ứng: 1, 2, 3...
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  isBulletList?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit: 'contain' | 'cover' | 'fill';
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  caption?: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
  headerBgColor: string;
  headerTextColor: string;
  rowAltColor: string;
  borderColor: string;
  fontSize: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'donut';
  title: string;
  data: ChartDataPoint[];
}

export interface SmartArtElement extends BaseElement {
  type: 'smartart';
  smartArtType: 'process' | 'cycle' | 'hierarchy' | 'cards' | 'timeline';
  title?: string;
  items: { id: string; title: string; desc?: string; color: string; icon?: string }[];
}

export interface WordArtElement extends BaseElement {
  type: 'wordart';
  text: string;
  stylePreset: 'rainbow' | 'golden' | 'neon' | 'ocean' | 'fire';
  fontSize: number;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  url: string; // YouTube embed, Facebook embed, file data/blob URL, or video URL
  title?: string;
  sourceType?: 'file' | 'youtube' | 'facebook' | 'url';
}

export interface AudioElement extends BaseElement {
  type: 'audio';
  url: string;
  title: string;
  sourceType?: 'file' | 'url';
}

export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
  title: string;
  description?: string;
}

export interface CameoElement extends BaseElement {
  type: 'cameo';
  shape: 'circle' | 'rounded' | 'rect';
  showMirror: boolean;
}

export type SlideElement = 
  | TextElement 
  | ShapeElement 
  | ImageElement 
  | TableElement 
  | ChartElement 
  | SmartArtElement 
  | WordArtElement 
  | VideoElement 
  | AudioElement 
  | LinkElement
  | CameoElement;

export interface Slide {
  id: string;
  title: string;
  notes: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  elements: SlideElement[];
  transition?: TransitionType;
}

export interface PresentationTheme {
  id: string;
  name: string;
  slideBg: string;
  slideGradient?: string;
  textColor: string;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface Presentation {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  author: string;
  updatedAt: string;
  aspectRatio: '16:9' | '4:3';
  themeId: string;
  slides: Slide[];
}

export type ActiveTab = 
  | 'file' 
  | 'home' 
  | 'insert' 
  | 'design' 
  | 'transitions' 
  | 'animations' 
  | 'slideshow' 
  | 'repository' 
  | 'help';

export type ViewMode = 'normal' | 'sorter' | 'reading' | 'slideshow';
