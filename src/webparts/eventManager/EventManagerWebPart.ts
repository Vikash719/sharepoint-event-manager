import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import EventManager from "./components/EventManager";

export default class EventManagerWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(EventManager, {
      siteUrl: this.context.pageContext.web.absoluteUrl,
      context: this.context,
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
