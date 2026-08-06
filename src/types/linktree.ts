export interface LinktreeItem {
  id: string;
  title: string;
  targetUrl: string;
  iconType: "spotify" | "audiomack" | "youtube" | "apple" | "instagram" | "twitter" | "x" | "tiktok" | "facebook" | "email" | "generic" | string;
  order: number;
  isActive: boolean;
  clickCount: number;
  createdAt?: any;
}
