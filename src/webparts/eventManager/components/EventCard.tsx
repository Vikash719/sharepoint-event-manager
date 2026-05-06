import * as React from "react";
import { IEvent } from "./models/Event";
import styles from "./EventManager.module.scss";

interface Props {
  event: IEvent;
  onClick: (event: IEvent) => void;
}

const EventCard: React.FC<Props> = ({ event, onClick }) => {
  const defaultImage =
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678";
  const imageSrc =
    event.imageUrl && event.imageUrl !== "" ? event.imageUrl : defaultImage;

  return (
    <article
      className={styles.card}
      onClick={() => onClick(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(event);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img
        src={imageSrc}
        alt={event.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = defaultImage;
        }}
      />

      <div className={styles.cardBody}>
        <h3>{event.title}</h3>

        <p>
          <strong>When:</strong> {new Date(event.dateTime).toLocaleString()}
        </p>

        <p>
          <strong>Where:</strong> {event.location}
        </p>

        <button
          className={`${styles.button} ${styles.cardButton}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(event);
          }}
        >
          View Event
        </button>
      </div>
    </article>
  );
};

export default EventCard;
