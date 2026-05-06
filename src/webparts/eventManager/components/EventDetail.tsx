import * as React from "react";
import { useState } from "react";
import { IEvent } from "./models/Event";
import EventModal from "./EventModal";
import styles from "./EventManager.module.scss";

interface Props {
  event: IEvent;
  onBack: () => void;
  onUpdate: (e: IEvent) => void;
  onDelete: (id: number) => void;
}

const EventDetail: React.FC<Props> = ({
  event,
  onBack,
  onUpdate,
  onDelete,
}) => {
  const [edit, setEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.detailContainer}>
        <button
          className={`${styles.button} ${styles.backButton}`}
          onClick={onBack}
        >
          &lt; Back
        </button>

        <div className={styles.hero}>
          <img
            src={
              event.imageUrl && event.imageUrl !== ""
                ? event.imageUrl
                : "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
            }
            alt={event.title}
          />

          <div className={styles.heroOverlay}>
            <p className={styles.eyebrow}>Event details</p>
            <h1>{event.title}</h1>
            <p>{new Date(event.dateTime).toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.detailContent}>
          <p className={styles.detailDescription}>{event.description}</p>

          <div className={styles.detailInfo}>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          </div>

          <div className={styles.detailButtons}>
            <button className={styles.button} onClick={() => setEdit(true)}>
              Edit Event
            </button>

            <button
              className={`${styles.button} ${styles.deleteButton}`}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Event
            </button>
          </div>

          {showDeleteConfirm && (
            <div className={styles.deleteConfirmBox}>
              <p>Are you sure you want to delete this event?</p>

              <div className={styles.deleteConfirmActions}>
                <button
                  className={`${styles.button} ${styles.deleteButton}`}
                  onClick={() => onDelete(event.id)}
                >
                  Yes, Delete
                </button>

                <button
                  className={`${styles.button} ${styles.clearButton}`}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {edit && (
          <EventModal
            existing={event}
            onClose={() => setEdit(false)}
            onSave={onUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetail;
