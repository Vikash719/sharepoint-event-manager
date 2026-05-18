import * as React from "react";
import { IEventManagerProps } from "./IEventManagerProps";
import { IEvent } from "./models/Event";
import Dashboard, { ViewMode, getDateKey } from "./Dashboard";
import EventDetail from "./EventDetail";
import styles from "./EventManager.module.scss";

import { SPFI, spfi, SPFx } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

interface State {
  events: IEvent[];
  selected?: IEvent;
  loading: boolean;
  sp: SPFI;
  dashboardViewMode: ViewMode;
  calendarMonth: Date;
  selectedDateKey: string;
}

interface ISharePointAttachment {
  ServerRelativeUrl: string;
}

interface ISharePointEventItem {
  ID: number;
  Title?: string;
  Description?: string;
  EventDate: string;
  Location?: string;
  AttachmentFiles?: ISharePointAttachment[];
}

interface IAddResult {
  ID: number;
}

export default class EventManager extends React.Component<
  IEventManagerProps,
  State
> {
  constructor(props: IEventManagerProps) {
    super(props);

    const sp = spfi().using(SPFx(this.props.context));

    this.state = {
      events: [],
      selected: undefined,
      loading: false,
      sp,
      dashboardViewMode: this.props.viewMode || "grid",
      calendarMonth: new Date(),
      selectedDateKey: getDateKey(new Date()),
    };
  }

  public componentDidMount(): void {
    this.loadEvents().catch(() => this.setState({ loading: false }));
  }
  public componentDidUpdate(prevProps: IEventManagerProps): void {
    if (this.props.viewMode !== prevProps.viewMode) {
      this.setState({
        dashboardViewMode: this.props.viewMode || "grid",
      });
    }
  }
  private loadEvents = async (): Promise<void> => {
    try {
      this.setState({ loading: true });

      const items = (await this.state.sp.web.lists
        .getByTitle("EventsNew")
        .items.select("ID", "Title", "Description", "EventDate", "Location")
        .expand("AttachmentFiles")()) as ISharePointEventItem[];

      const events: IEvent[] = items.map((item) => ({
        id: item.ID,
        title: item.Title || "",
        description: item.Description || "",
        dateTime: item.EventDate,
        location: item.Location || "",
        imageUrl:
          item.AttachmentFiles && item.AttachmentFiles.length > 0
            ? item.AttachmentFiles[0].ServerRelativeUrl
            : "",
      }));

      this.setState({
        events,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading events:", error);
      this.setState({ loading: false });
    }
  };

  // ================= ADD EVENT =================
  private addEvent = async (event: IEvent): Promise<void> => {
    try {
      const addResult = (await this.state.sp.web.lists
        .getByTitle("EventsNew")
        .items.add({
          Title: event.title,
          Description: event.description,
          EventDate: new Date(event.dateTime),
          Location: event.location,
        })) as IAddResult;

      if (event.imageFile) {
        await this.state.sp.web.lists
          .getByTitle("EventsNew")
          .items.getById(addResult.ID)
          .attachmentFiles.add(event.imageFile.name, event.imageFile);
      }

      await this.loadEvents();

      console.log("Event added successfully");
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };
  // ================= UPDATE EVENT =================
  private updateEvent = async (event: IEvent): Promise<void> => {
    try {
      if (event.imageFile) {
        await this.state.sp.web.lists
          .getByTitle("EventsNew")
          .items.getById(event.id)
          .attachmentFiles.add(event.imageFile.name, event.imageFile);
      }

      await this.state.sp.web.lists
        .getByTitle("EventsNew")
        .items.getById(event.id)
        .update({
          Title: event.title,
          Description: event.description,
          EventDate: new Date(event.dateTime),
          Location: event.location,
        });

      await this.loadEvents();

      console.log("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };
  // ================= DELETE EVENT =================

  private deleteEvent = async (id: number): Promise<void> => {
    try {
      await this.state.sp.web.lists
        .getByTitle("EventsNew")
        .items.getById(id)
        .delete();

      this.setState((prev) => ({
        events: prev.events.filter((e) => e.id !== id),
        selected: undefined,
      }));

      console.log("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // ================= RENDER =================

  public render(): React.ReactElement<IEventManagerProps> {
    const themeClass =
      this.props.theme === "light"
        ? `${styles.container} ${styles.containerLight}`
        : styles.container;

    return (
      <div className={themeClass}>
        {this.state.loading && <p>Loading...</p>}

        {!this.state.selected ? (
          <Dashboard
            events={this.state.events}
            onAdd={this.addEvent}
            onSelect={(e) => this.setState({ selected: e })}
            viewMode={this.state.dashboardViewMode}
            onViewModeChange={(viewMode) =>
              this.setState({ dashboardViewMode: viewMode })
            }
            dashboardTitleColor={this.props.dashboardTitleColor}
            eyebrowTextColor={this.props.eyebrowTextColor}
            showSearch={this.props.showSearch}
            cardBackgroundColor={this.props.cardBackgroundColor}
            searchBarBackgroundColor={this.props.searchBarBackgroundColor}
            cardFontColor={this.props.cardFontColor}
            viewEventButtonColor={this.props.viewEventButtonColor}
            calendarMonth={this.state.calendarMonth}
            onCalendarMonthChange={(calendarMonth) =>
              this.setState({ calendarMonth })
            }
            selectedDateKey={this.state.selectedDateKey}
            onSelectedDateKeyChange={(selectedDateKey) =>
              this.setState({ selectedDateKey })
            }
          />
        ) : (
          <EventDetail
            event={this.state.selected}
            onBack={() => this.setState({ selected: undefined })}
            onUpdate={this.updateEvent}
            onDelete={this.deleteEvent}
          />
        )}
      </div>
    );
  }
}
