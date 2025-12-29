import { useState, useEffect, useRef } from 'react'
import notificationData from './notifications'
import './App.css'

const NotificationsList = ({ 
  notifications, 
  setNotifications, 
  filter, 
  searchQuery 
}) => {
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const listRef = useRef(null)

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setSelectedNotifications(prev => prev.filter(n => n !== id))
  }

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAsUnread = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setSelectedNotifications([])
  }

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedNotifications.length} notification(s)?`)) {
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.includes(n.id))
      )
      setSelectedNotifications([])
    }
  }

  const handleMarkSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        selectedNotifications.includes(n.id) ? { ...n, read: true } : n
      )
    )
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--priority-low)'
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      reminder: '⏰',
      network: '🔗',
      meeting: '👥'
    }
    return icons[type] || '📢'
  }

  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    if (filter !== 'all' && filter !== 'unread' && filter !== 'read' && 
        notification.category !== filter) return false
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        notification.name.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.category.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const categories = [...new Set(notifications.map(n => n.category))]

  // Auto-scroll to top when new notifications are added
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [notifications])

  return (
    <div className="notifications-container" ref={listRef}>
      <div className="notifications-header">
        <div className="header-main">
          <h1>
            <span className="header-icon">🔔</span>
            Notifications
            {unreadCount > 0 && (
              <span className="unread-count-badge">{unreadCount}</span>
            )}
          </h1>
          <div className="stats">
            <span className="stat-item">
              Total: <strong>{notifications.length}</strong>
            </span>
            <span className="stat-item">
              Unread: <strong>{unreadCount}</strong>
            </span>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="bulk-actions">
            <div className="select-all">
              <input
                type="checkbox"
                checked={selectedNotifications.length > 0 && 
                         selectedNotifications.length === filteredNotifications.length}
                onChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all">
                {selectedNotifications.length > 0 
                  ? `${selectedNotifications.length} selected`
                  : 'Select all'}
              </label>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="selected-actions">
                <button 
                  className="action-btn"
                  onClick={handleMarkSelectedAsRead}
                  title="Mark selected as read"
                >
                  ✓ Mark as read
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={handleDeleteSelected}
                  title="Delete selected"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No notifications found</h3>
          <p>{searchQuery ? 'Try a different search term' : 'All caught up!'}</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${
                selectedNotifications.includes(notification.id) ? 'selected' : ''
              }`}
              onClick={() => handleSelectNotification(notification.id)}
            >
              <div className="notification-select">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select notification from ${notification.name}`}
                />
              </div>

              <div className="notification-icon">
                <span className="type-icon">{getTypeIcon(notification.type)}</span>
              </div>

              <img 
                src={notification.avatar} 
                alt={`${notification.name} avatar`}
                className="avatar"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${notification.name}&background=random`
                }}
              />

              <div className="notification-content">
                <div className="notification-header">
                  <div className="sender-info">
                    <h3 className="sender-name">{notification.name}</h3>
                    <div className="notification-meta">
                      <span className="time">{notification.time}</span>
                      <span className="category">{notification.category}</span>
                      <span 
                        className="priority" 
                        style={{ 
                          backgroundColor: getPriorityColor(notification.priority) 
                        }}
                        title={`Priority: ${notification.priority}`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="message">{notification.message}</p>
              </div>

              <div className="notification-actions">
                {!notification.read ? (
                  <button 
                    className="action-btn mark-read-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead(notification.id)
                    }}
                    aria-label="Mark as read"
                  >
                    ✓
                  </button>
                ) : (
                  <button 
                    className="action-btn mark-unread-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsUnread(notification.id)
                    }}
                    aria-label="Mark as unread"
                  >
                    👁️
                  </button>
                )}
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDismissNotification(notification.id)
                  }}
                  aria-label="Delete notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage or use initial data
    const saved = localStorage.getItem('notifications')
    return saved ? JSON.parse(saved) : notificationData
  })
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [autoMarkRead, setAutoMarkRead] = useState(false)
  const [notificationsPerPage, setNotificationsPerPage] = useState(10)

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([])
      localStorage.removeItem('notifications')
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset to default notifications?')) {
      setNotifications(notificationData)
    }
  }

  const handleImportDemo = () => {
    const demoNotifications = [
      ...notifications,
      ...notificationData.map(n => ({
        ...n,
        id: notifications.length + n.id,
        read: false
      }))
    ].slice(0, 20) // Limit to 20 notifications
    setNotifications(demoNotifications)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const categories = [...new Set(notifications.map(n => n.category))]

  // Sort notifications
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (sortBy === 'time') {
      // Simple time sorting (you would need proper timestamps for real sorting)
      return b.id - a.id
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return 0
  })

  // Auto-mark as read on hover if enabled
  const handleNotificationHover = (id) => {
    if (autoMarkRead && !notifications.find(n => n.id === id)?.read) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Notification Center</h1>
          <p className="subtitle">Manage your alerts and updates</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="icon-btn settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            ⚙️
          </button>
          <button 
            className="icon-btn filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filters"
          >
            🔍
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <h3>Notification Settings</h3>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={autoMarkRead}
                onChange={(e) => setAutoMarkRead(e.target.checked)}
              />
              Auto-mark as read on hover
            </label>
          </div>
          <div className="setting-item">
            <label>
              Items per page:
              <select
                value={notificationsPerPage}
                onChange={(e) => setNotificationsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="controls-panel">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search notifications"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button 
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.filter(n => n.read).length})
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="time">Newest first</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="category-filters">
            <div className="filter-group">
              <span className="filter-label">Categories:</span>
              <div className="category-buttons">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${filter === category ? 'active' : ''}`}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                ))}
                <button
                  className="category-btn"
                  onClick={() => setFilter('all')}
                >
                  Clear filter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.read)}
          >
            Mark all as read
          </button>
          <button 
            className="action-btn secondary"
            onClick={handleImportDemo}
          >
            Add demo data
          </button>
          <button 
            className="action-btn warning"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </button>
          <button 
            className="action-btn info"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      <NotificationsList
        notifications={sortedNotifications.slice(0, notificationsPerPage)}
        setNotifications={setNotifications}
        filter={filter}
        searchQuery={searchQuery}
      />

      {notifications.length > notificationsPerPage && (
        <div className="pagination">
          <button className="pagination-btn">
            Show more ({notifications.length - notificationsPerPage} remaining)
          </button>
        </div>
      )}

      <div className="app-footer">
        <div className="footer-content">
          <div className="keyboard-shortcuts">
            <span className="shortcut-hint">Shortcuts:</span>
            <kbd>Esc</kbd> Close • <kbd>Space</kbd> Toggle select • <kbd>Enter</kbd> Open
          </div>
          <div className="status">
            {notifications.length} notifications • {notifications.filter(n => !n.read).length} unread
          </div>
        </div>
      </div>
    </div>
  )
}

export default App