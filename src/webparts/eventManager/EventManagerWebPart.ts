import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
} from "@microsoft/sp-property-pane";

import EventManager from "./components/EventManager";

export interface IEventManagerWebPartProps {
  theme: "dark" | "light";
}

export default class EventManagerWebPart extends BaseClientSideWebPart<IEventManagerWebPartProps> {
  public render(): void {
    const element = React.createElement(EventManager, {
      siteUrl: this.context.pageContext.web.absoluteUrl,
      context: this.context,
      theme: this.properties.theme || "dark",
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
