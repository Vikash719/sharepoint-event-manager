import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IEventManagerProps {
  siteUrl: string;
  context: WebPartContext;
  theme?: "dark" | "light";
  viewMode?: "grid" | "calendar";
  dashboardTitleColor?: string;
  eyebrowTextColor?: string;
  showSearch?: boolean;
  cardBackgroundColor?: string;
  searchBarBackgroundColor?: string;
  cardFontColor?: string;
  viewEventButtonColor?: string;
}
