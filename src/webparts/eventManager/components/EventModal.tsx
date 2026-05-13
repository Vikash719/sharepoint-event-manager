import * as React from "react";
import { useState, useEffect } from "react";

import { IEvent } from "./models/Event";

import styles from "./EventManager.module.scss";

interface Props {
  onClose: () => void;
  onSave: (e: IEvent) => void;
  existing?: IEvent;
  defaultDateTime?: string;
}

const getFileNameFromUrl = (url: string): string => {
  const cleanUrl = url.split("?")[0];
  const fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

const EventModal: React.FC<Props> = ({
  onClose,
  onSave,
  existing,
  defaultDateTime,
}) => {
  const [title, setTitle] = useState(existing?.title || "");

  const [desc, setDesc] = useState(existing?.description || "");

  const openPicker = (event: React.SyntheticEvent<HTMLInputElement>): void => {
    const target = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    target.showPicker?.();
  };

  const [dateTime, setDateTime] = useState(
    existing?.dateTime
      ? new Date(existing.dateTime).toISOString().slice(0, 16)
      : defaultDateTime || "",
  );

  const [location, setLocation] = useState(existing?.location || "");

  const [file, setFile] = useState<File | undefined>();

  const [previewUrl, setPreviewUrl] = useState<string>(
    existing?.imageUrl || "",
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const existingImageName = existing?.imageUrl
    ? getFileNameFromUrl(existing.imageUrl)
    : "";
  const imageText = file ? file.name : existingImageName || "No image selected";

  useEffect(() => {
    let objectUrl: string | undefined;

    if (file) {
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(existing?.imageUrl || "");
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, existing?.imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFile(
      e.target.files && e.target.files.length > 0
        ? e.target.files[0]
        : undefined,
    );
  };

  const save = async (): Promise<void> => {
    if (saving) {
      return;
    }

    setError("");

    if (!title || !dateTime || !location) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);

    const newEvent: IEvent = {
      id: existing?.id || 0,
      title,
      description: desc,
      dateTime: new Date(dateTime).toISOString(),
      location,
      imageUrl: existing?.imageUrl || "",
      imageFile: file,
    };

    try {
      await onSave(newEvent);
    } catch (err) {
      console.error(err);
      setError("Error saving event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>{existing ? "Update" : "Create"}</p>

            <h3>{existing ? "Edit Event" : "Add Event"}</h3>
          </div>

          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
          >
            X
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.form}>
          <label className={styles.fieldLabel}>
            Title <span className={styles.requiredMark}>*</span>
          </label>

          <input
            className={styles.input}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className={styles.fieldLabel}>Description</label>

          <textarea
            className={styles.textarea}
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <label className={styles.fieldLabel}>
            Date and Time <span className={styles.requiredMark}>*</span>
          </label>

          <input
            type="datetime-local"
            className={styles.input}
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            onClick={openPicker}
          />

          <label className={styles.fieldLabel}>
            Location <span className={styles.requiredMark}>*</span>
          </label>

          <input
            className={styles.input}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label className={styles.fieldLabel}>Image</label>

          <div className={styles.filePickerRow}>
            <label className={`${styles.button} ${styles.filePickerButton}`}>
              Choose Image
              <input
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            <span className={styles.filePickerText}>{imageText}</span>
          </div>

          {previewUrl && (
            <div className={styles.imagePreview}>
              <img src={previewUrl} alt="Selected image preview" />
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.button}
              type="button"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              className={`${styles.button} ${styles.clearButton}`}
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
