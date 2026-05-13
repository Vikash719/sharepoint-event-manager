import * as React from "react";
import { useEffect, useState } from "react";
import { IEvent } from "./models/Event";
import EventModal from "./EventModal";
import styles from "./EventManager.module.scss";
import { defaultEventImage } from "./defaultEventImage";

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
  const hasEventImage = !!event.imageUrl?.trim();
  const imageSrc =
    event.imageUrl && event.imageUrl !== "" ? event.imageUrl : defaultEventImage;
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [viewerImageSrc, setViewerImageSrc] = useState(imageSrc);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const canViewImage = hasEventImage && !imageLoadFailed;

  useEffect(() => {
    setImageLoadFailed(false);
    setViewerImageSrc(imageSrc);
  }, [imageSrc]);

  useEffect(() => {
    if (!canViewImage) {
      setShowImageViewer(false);
    }
  }, [canViewImage]);

  useEffect(() => {
    if (!showImageViewer) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setShowImageViewer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showImageViewer]);

  return (
    <div className={styles.detailContainer}>
      <button
        className={`${styles.button} ${styles.backButton}`}
        onClick={onBack}
      >
        &lt; Back
      </button>

      <div className={styles.hero}>
        <button
          type="button"
          className={styles.heroImageButton}
          onClick={() => {
            if (canViewImage) {
              setShowImageViewer(true);
            }
          }}
          disabled={!canViewImage}
          aria-label={`View image for ${event.title}`}
        >
          <img
            className={!canViewImage ? styles.placeholderImage : undefined}
            src={viewerImageSrc}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.classList.add(styles.placeholderImage);
              setImageLoadFailed(true);
              setViewerImageSrc(defaultEventImage);
            }}
          />
        </button>

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

      {showImageViewer && (
        <div
          className={styles.imageViewerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview for ${event.title}`}
          onClick={() => setShowImageViewer(false)}
        >
          <div
            className={styles.imageViewer}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.imageViewerClose}
              onClick={() => setShowImageViewer(false)}
              aria-label="Close image preview"
            >
              X
            </button>

            <img
              className={
                viewerImageSrc === defaultEventImage
                  ? styles.placeholderImage
                  : undefined
              }
              src={viewerImageSrc}
              alt={event.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.classList.add(styles.placeholderImage);
                setImageLoadFailed(true);
                setViewerImageSrc(defaultEventImage);
                setShowImageViewer(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
