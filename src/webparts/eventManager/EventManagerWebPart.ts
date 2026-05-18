import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-property-pane";

import EventManager from "./components/EventManager";

export interface IEventManagerWebPartProps {
  theme: "dark" | "light";
  viewMode: "grid" | "calendar";
  dashboardTitleColor: string;
  eyebrowTextColor: string;
  showSearch: boolean;
  cardBackgroundColor: string;
  searchBarBackgroundColor: string;
  cardFontColor: string;
  viewEventButtonColor: string;
}

export default class EventManagerWebPart extends BaseClientSideWebPart<IEventManagerWebPartProps> {
  public render(): void {
    const element = React.createElement(EventManager, {
      siteUrl: this.context.pageContext.web.absoluteUrl,
      context: this.context,
      theme: this.properties.theme || "dark",
      viewMode: this.properties.viewMode || "grid",
      dashboardTitleColor: this.properties.dashboardTitleColor,
      eyebrowTextColor: this.properties.eyebrowTextColor,
      showSearch: this.properties.showSearch !== false,
      cardBackgroundColor: this.properties.cardBackgroundColor,
      searchBarBackgroundColor: this.properties.searchBarBackgroundColor,
      cardFontColor: this.properties.cardFontColor,
      viewEventButtonColor: this.properties.viewEventButtonColor,
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Customize the Event Manager appearance",
          },
          groups: [
            {
              groupName: "Appearance",
              groupFields: [
                PropertyPaneDropdown("theme", {
                  label: "Theme",
                  options: [
                    { key: "dark", text: "Dark" },
                    { key: "light", text: "Light" },
                  ],
                }),
                PropertyPaneDropdown("viewMode", {
                  label: "Default View Mode",
                  options: [
                    { key: "grid", text: "Grid" },
                    { key: "calendar", text: "Calendar" },
                  ],
                }),
                PropertyPaneToggle("showSearch", {
                  label: "Show Search Bar",
                }),
              ],
            },
            {
              groupName: "Custom Colors",
              groupFields: [
                PropertyPaneTextField("dashboardTitleColor", {
                  label: "Dashboard Title Color (e.g. #ffffff or rgba(...))",
                }),
                PropertyPaneTextField("eyebrowTextColor", {
                  label: "Eyebrow Text Color",
                }),
                PropertyPaneTextField("searchBarBackgroundColor", {
                  label: "Search Bar Background Color",
                }),
                PropertyPaneTextField("cardBackgroundColor", {
                  label: "Card Background Color",
                }),
                PropertyPaneTextField("cardFontColor", {
                  label: "Card Font Color",
                }),
                PropertyPaneTextField("viewEventButtonColor", {
                  label: "View Event Button Color",
                }),
              ],
            },
          ],
        },
      ],
    };
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
