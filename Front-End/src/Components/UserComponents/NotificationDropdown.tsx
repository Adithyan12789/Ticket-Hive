import { useState, useEffect, useRef } from 'react';
import styles from './NotificationDropdown.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

interface Notification {
  _id: number;
  message: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[] | null;
  onNotificationClick: (notificationId: number) => void;
  onClearAll: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? 'Invalid Date'
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
}

export function NotificationDropdown({ notifications, onNotificationClick, onClearAll }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notificationCount = notifications?.length ?? 0;

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      <button className={styles.notificationButton} onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
        {notificationCount > 0 && (
          <span className={styles.notificationBadge}>{notificationCount}</span>
        )}
      </button>
      <div className={`${styles.notificationDropdown} ${isOpen ? styles.show : ''}`}>
        <h3 className={styles.notificationHeader}>Notifications</h3>
        {!notifications || notificationCount === 0 ? (
          <p className={styles.noNotifications}>No new notifications</p>
        ) : (
          <>
            <ul className={styles.notificationList}>
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={styles.notificationItem}
                  onClick={() => {
                    onNotificationClick(notification._id);
                    setIsOpen(false);
                  }}
                >
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationDate}>
                    {formatDate(notification.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className={styles.clearAllButton}
              onClick={() => {
                onClearAll();
                setIsOpen(false);
              }}
            >
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
}

