import { useState } from 'react'
import reactLogo from './assets/react.svg'
import notificationData from './notifications';
import './App.css';


const NotificationsList = ({ notifications, setNotifications, children }) => {


  const handleDismissNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  }

  return (
    <div className="notifications-container">
      {children}
      <ul>
        {
          notifications.map((notification, index) => (
            <li key={notification.id} className={`notification-item animate__animated animate__fadeIn animate__delay-${index}s`}>
              
              <div className="notification-content">
                <h2>{notification.name}</h2>
                <p>{notification.message}</p>
              </div>
              <div>
                <button className="notification-button"
                  onClick={() => handleDismissNotification(notification.id)}
                >Dismiss</button>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

function App() {

  const [notifications, setNotifications] = useState(notificationData);

  const handleClearAll = () => {
    setNotifications([]);
  }

  return (
    <>
      <NotificationsList
        notifications={notifications}
        setNotifications={setNotifications}
      >
        <h1>Notification List ({notifications.length})</h1>

        {
          notifications.length === 0 ? (
            <p className="animate__animated animate__fadeIn">No notifications to display.</p>
          ) : (
            <button className="notification-button" onClick={handleClearAll}>
              Clear all Notifications
            </button>
          )}
      </NotificationsList>
    </>
  )
}

export default App