import * as React from "react";
import { useState } from "react";

import { IEvent } from "./models/Event";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import { defaultEventImage } from "./defaultEventImage";

import styles from "./EventManager.module.scss";

export type ViewMode = "grid" | "calendar";

interface Props {
  events: IEvent[];
  onAdd: (e: IEvent) => void;
  onSelect: (e: IEvent) => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  calendarMonth: Date;
  onCalendarMonthChange: (date: Date) => void;
  selectedDateKey: string;
  onSelectedDateKeyChange: (dateKey: string) => void;
}

interface ICalendarDay {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: IEvent[];
}

const padDatePart = (value: number): string => {
  return value < 10 ? `0${value}` : `${value}`;
};

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());

  return `${year}-${month}-${day}`;
};

const getEventDateKey = (event: IEvent): string => {
  return getDateKey(new Date(event.dateTime));
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatMonth = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const formatEventTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const hasEventImage = (event: IEvent): boolean => {
  return !!event.imageUrl?.trim();
};

const Dashboard: React.FC<Props> = ({
  events,
  onAdd,
  onSelect,
  viewMode,
  onViewModeChange,
  calendarMonth,
  onCalendarMonthChange,
  selectedDateKey,
  onSelectedDateKeyChange,
}) => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [defaultModalDateTime, setDefaultModalDateTime] = useState<
    string | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);

  const eventsPerPage = 8;

  const openPicker = (event: React.SyntheticEvent<HTMLInputElement>): void => {
    const target = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    target.showPicker?.();
  };

  const filtered = events.filter((e) => {
    const matchTitle =
      e.title.toLowerCase().indexOf(search.toLowerCase()) !== -1;

    const eventDate = new Date(e.dateTime).getTime();
    const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
    const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;
    const matchDate = (!from || eventDate >= from) && (!to || eventDate <= to);

    return matchTitle && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filtered.slice(startIndex, endIndex);
  const eventsByDate = filtered.reduce(
    (grouped: { [dateKey: string]: IEvent[] }, event: IEvent) => {
      const key = getEventDateKey(event);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(event);

      return grouped;
    },
    {},
  );
  const selectedDateEvents = (eventsByDate[selectedDateKey] || [])
    .slice()
    .sort(
      (first: IEvent, second: IEvent) =>
        new Date(first.dateTime).getTime() - new Date(second.dateTime).getTime(),
    );
  const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
  const calendarDays: ICalendarDay[] = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay.getTime());
    const todayKey = getDateKey(new Date());
    const days: ICalendarDay[] = [];

    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate.getTime());
      date.setDate(startDate.getDate() + i);

      const key = getDateKey(date);

      days.push({
        date,
        key,
        isCurrentMonth: date.getMonth() === month,
        isToday: key === todayKey,
        events: eventsByDate[key] || [],
      });
    }

    return days;
  })();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handlePrevPage = (): void => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousMonth = (): void => {
    onCalendarMonthChange(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = (): void => {
    onCalendarMonthChange(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
    );
  };

  const handleToday = (): void => {
    const today = new Date();

    onCalendarMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectedDateKeyChange(getDateKey(today));
  };

  const openAddModal = (defaultDateTime?: string): void => {
    setDefaultModalDateTime(defaultDateTime);
    setShowModal(true);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Events</p>
          <h2>Event Dashboard</h2>
        </div>

        <button
          className={`${styles.button} ${styles.addButton}`}
          onClick={() => openAddModal()}
        >
          + Add Event
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Search</label>

          <input
            className={styles.filterInput}
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>From</label>

          <input
            type="date"
            className={styles.input}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onClick={openPicker}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>To</label>

          <input
            type="date"
            className={styles.input}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onClick={openPicker}
          />
        </div>

        <button
          className={`${styles.button} ${styles.clearButton}`}
          onClick={() => {
            setSearch("");
            setFromDate("");
            setToDate("");
          }}
        >
          Clear
        </button>
      </div>

      <div className={styles.viewSwitcher} aria-label="Event view">
        <button
          type="button"
          className={`${styles.viewSwitchButton} ${
            viewMode === "grid" ? styles.activeView : ""
          }`}
          onClick={() => onViewModeChange("grid")}
        >
          Grid
        </button>

        <button
          type="button"
          className={`${styles.viewSwitchButton} ${
            viewMode === "calendar" ? styles.activeView : ""
          }`}
          onClick={() => onViewModeChange("calendar")}
        >
          Calendar
        </button>
      </div>

      {viewMode === "grid" ? (
        <React.Fragment>
          <div className={styles.grid}>
            {paginatedEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateTitle}>No events found</div>

                <div className={styles.emptyStateText}>
                  Try adjusting filters or add a new event
                </div>
              </div>
            ) : (
              paginatedEvents.map((e) => (
                <EventCard key={e.id} event={e} onClick={onSelect} />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.button} ${styles.paginationButton}`}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                &lt; Previous
              </button>

              <div className={styles.pageNumbers}>
                {(() => {
                  const pages: number[] = [];
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }

                  return pages.map((page: number) => (
                    <button
                      key={page}
                      className={`${styles.pageNumber} ${
                        page === currentPage ? styles.activePage : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>

              <button
                className={`${styles.button} ${styles.paginationButton}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next &gt;
              </button>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className={styles.calendarView}>
          <div className={styles.calendarToolbar}>
            <div>
              <p className={styles.eyebrow}>Calendar</p>
              <h3>{formatMonth(calendarMonth)}</h3>
            </div>

            <div className={styles.calendarControls}>
              <button
                type="button"
                className={`${styles.button} ${styles.calendarNavButton}`}
                onClick={handlePreviousMonth}
              >
                &lt;
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.calendarTodayButton}`}
                onClick={handleToday}
              >
                Today
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.calendarNavButton}`}
                onClick={handleNextMonth}
              >
                &gt;
              </button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (dayName: string) => (
                <div key={dayName} className={styles.calendarWeekday}>
                  {dayName}
                </div>
              ),
            )}

            {calendarDays.map((day: ICalendarDay) => (
              <button
                key={day.key}
                type="button"
                className={`${styles.calendarDay} ${
                  !day.isCurrentMonth ? styles.outsideMonth : ""
                } ${day.isToday ? styles.todayCell : ""} ${
                  selectedDateKey === day.key ? styles.selectedDay : ""
                }`}
                onClick={() => onSelectedDateKeyChange(day.key)}
              >
                <span className={styles.dayNumber}>{day.date.getDate()}</span>

                {day.events.length === 1 && (
                  <span className={styles.singleEventPreview}>
                    <img
                      className={
                        !hasEventImage(day.events[0])
                          ? styles.placeholderImage
                          : undefined
                      }
                      src={day.events[0].imageUrl || defaultEventImage}
                      alt={day.events[0].title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.classList.add(styles.placeholderImage);
                        e.currentTarget.src = defaultEventImage;
                      }}
                    />
                    <span>{day.events[0].title}</span>
                  </span>
                )}

                {day.events.length > 1 && (
                  <span className={styles.multiEventList}>
                    {day.events.slice(0, 3).map((event: IEvent) => (
                      <span key={event.id} className={styles.calendarEventName}>
                        {event.title}
                      </span>
                    ))}

                    {day.events.length > 3 && (
                      <span className={styles.moreEvents}>
                        +{day.events.length - 3} more
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.selectedDatePanel}>
            <div className={styles.selectedDateHeader}>
              <div>
                <p className={styles.eyebrow}>Selected date</p>
                <h3>{formatDate(selectedDate)}</h3>
              </div>

              <button
                type="button"
                className={`${styles.button} ${styles.addOnDateButton}`}
                onClick={() => openAddModal(`${selectedDateKey}T09:00`)}
              >
                + Add Event
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className={styles.noDateEvents}>No events on this date.</p>
            ) : (
              <div className={styles.selectedEventList}>
                {selectedDateEvents.map((event: IEvent) => (
                  <button
                    type="button"
                    key={event.id}
                    className={styles.selectedEventItem}
                    onClick={() => onSelect(event)}
                  >
                    <img
                      className={
                        !hasEventImage(event)
                          ? styles.placeholderImage
                          : undefined
                      }
                      src={event.imageUrl || defaultEventImage}
                      alt={event.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.classList.add(styles.placeholderImage);
                        e.currentTarget.src = defaultEventImage;
                      }}
                    />

                    <span>
                      <strong>{event.title}</strong>
                      <small>
                        {formatEventTime(event.dateTime)}
                        {event.location ? ` - ${event.location}` : ""}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <EventModal
          defaultDateTime={defaultModalDateTime}
          onClose={() => {
            setDefaultModalDateTime(undefined);
            setShowModal(false);
          }}
          onSave={async (e) => {
            await onAdd(e);
            setDefaultModalDateTime(undefined);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
