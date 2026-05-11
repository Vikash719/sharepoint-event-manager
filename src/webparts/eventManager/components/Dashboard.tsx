import * as React from "react";
import { useState } from "react";

import { IEvent } from "./models/Event";
import EventCard from "./EventCard";
import EventModal from "./EventModal";

import styles from "./EventManager.module.scss";

interface Props {
  events: IEvent[];
  onAdd: (e: IEvent) => void;
  onSelect: (e: IEvent) => void;
}

const Dashboard: React.FC<Props> = ({ events, onAdd, onSelect }) => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Events</p>
          <h2>Event Dashboard</h2>
        </div>

        <button
          className={`${styles.button} ${styles.addButton}`}
          onClick={() => setShowModal(true)}
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

      {showModal && (
        <EventModal
          onClose={() => setShowModal(false)}
          onSave={async (e) => {
            await onAdd(e);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
