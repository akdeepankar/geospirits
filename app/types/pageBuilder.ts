export type ComponentType = 'text' | 'paragraph' | 'heading' | 'html' | 'image' | 'button' | 'divider' | 'emoji' | 'gallery';

export interface ComponentStyle {
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  spooky?: boolean;
  galleryColumns?: number;
  galleryGap?: string;
}

export interface ButtonAction {
  type: 'none' | 'link' | 'confetti' | 'alert' | 'spookyEmojis' | 'singleEmoji';
  value?: string;
  emoji?: string;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  content: string;
  style?: ComponentStyle;
  action?: ButtonAction;
  images?: string[];
}

export interface DraggableItem {
  type: ComponentType;
  label: string;
  defaultContent: string;
}
