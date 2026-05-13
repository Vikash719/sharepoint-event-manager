import * as React from "react";
import { IEvent } from "./models/Event";
import styles from "./EventManager.module.scss";
import { defaultEventImage } from "./defaultEventImage";

interface Props {
  event: IEvent;
  onClick: (event: IEvent) => void;
}

const EventCard: React.FC<Props> = ({ event, onClick }) => {
  const hasEventImage = !!event.imageUrl?.trim();
  const imageSrc =
    event.imageUrl && event.imageUrl !== "" ? event.imageUrl : defaultEventImage;

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
        className={!hasEventImage ? styles.placeholderImage : undefined}
        src={imageSrc}
        alt={event.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.classList.add(styles.placeholderImage);
          e.currentTarget.src = defaultEventImage;
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
