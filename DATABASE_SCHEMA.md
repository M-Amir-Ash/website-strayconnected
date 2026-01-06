# StrayConnected Download Tracking Database Schema

This document provides the complete database schema for tracking downloads and managing the StrayConnected app distribution website.

## Database: stray_connected_downloads

---

## Table 1: downloads

Tracks every download attempt and completion.

```sql
CREATE TABLE downloads (
    download_id INT PRIMARY KEY AUTO_INCREMENT,
    platform ENUM('android', 'ios') NOT NULL,
    app_version VARCHAR(20) DEFAULT '1.0.0',
    download_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    referrer_url VARCHAR(500),
    device_type ENUM('mobile', 'tablet', 'desktop', 'unknown') DEFAULT 'unknown',
    screen_resolution VARCHAR(20),
    download_status ENUM('initiated', 'completed', 'failed') DEFAULT 'initiated',
    completion_timestamp DATETIME,
    INDEX idx_platform (platform),
    INDEX idx_timestamp (download_timestamp),
    INDEX idx_status (download_status)
);
```

**Purpose**: Track all download events with detailed user information for analytics.

---

## Table 2: app_versions

Manages different versions of the app available for download.

```sql
CREATE TABLE app_versions (
    version_id INT PRIMARY KEY AUTO_INCREMENT,
    platform ENUM('android', 'ios') NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    version_code INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_mb DECIMAL(10, 2),
    file_path VARCHAR(500) NOT NULL,
    release_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    min_os_version VARCHAR(20),
    changelog TEXT,
    download_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_version (platform, version_number),
    INDEX idx_active (is_active),
    INDEX idx_platform_active (platform, is_active)
);
```

**Purpose**: Maintain version history and control which versions are available for download.

---

## Table 3: download_analytics

Aggregated daily statistics for dashboard reporting.

```sql
CREATE TABLE download_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    platform ENUM('android', 'ios') NOT NULL,
    total_downloads INT DEFAULT 0,
    completed_downloads INT DEFAULT 0,
    failed_downloads INT DEFAULT 0,
    unique_ips INT DEFAULT 0,
    top_country_code VARCHAR(2),
    top_device_type VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily (date, platform),
    INDEX idx_date (date)
);
```

**Purpose**: Pre-aggregated data for faster dashboard queries.

---

## Table 4: visitors

Track unique visitors to the download page.

```sql
CREATE TABLE visitors (
    visitor_id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    first_visit DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_visit DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    visit_count INT DEFAULT 1,
    downloaded BOOLEAN DEFAULT FALSE,
    download_platform ENUM('android', 'ios'),
    INDEX idx_session (session_id),
    INDEX idx_first_visit (first_visit)
);
```

**Purpose**: Track unique visitors and conversion rates (visits vs downloads).

---

## Table 5: feedback

Collect user feedback about the app or download experience.

```sql
CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    download_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    feedback_type ENUM('download_issue', 'app_issue', 'feature_request', 'general') DEFAULT 'general',
    email VARCHAR(255),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    FOREIGN KEY (download_id) REFERENCES downloads(download_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_submitted (submitted_at)
);
```

**Purpose**: Gather user feedback to improve the app and download experience.

---

## Table 6: error_logs

Log any errors that occur during the download process.

```sql
CREATE TABLE error_logs (
    error_id INT PRIMARY KEY AUTO_INCREMENT,
    download_id INT,
    error_type VARCHAR(100),
    error_message TEXT,
    stack_trace TEXT,
    browser_info TEXT,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (download_id) REFERENCES downloads(download_id) ON DELETE SET NULL,
    INDEX idx_occurred (occurred_at),
    INDEX idx_error_type (error_type)
);
```

**Purpose**: Track technical issues for debugging and improvement.

---

## Table 7: admin_users

Manage admin access to the dashboard.

```sql
CREATE TABLE admin_users (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

**Purpose**: Secure admin authentication for dashboard access.

---

## Sample Queries

### Track a new download:
```sql
INSERT INTO downloads (platform, app_version, ip_address, user_agent, country_code, city, referrer_url, device_type, screen_resolution)
VALUES ('android', '1.0.0', '192.168.1.1', 'Mozilla/5.0...', 'US', 'New York', 'https://google.com', 'mobile', '1920x1080');
```

### Update download status to completed:
```sql
UPDATE downloads 
SET download_status = 'completed', completion_timestamp = NOW() 
WHERE download_id = 1;
```

### Get daily download statistics:
```sql
SELECT 
    DATE(download_timestamp) as date,
    platform,
    COUNT(*) as total_downloads,
    SUM(CASE WHEN download_status = 'completed' THEN 1 ELSE 0 END) as completed,
    COUNT(DISTINCT ip_address) as unique_ips
FROM downloads
WHERE download_timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(download_timestamp), platform
ORDER BY date DESC;
```

### Get platform distribution:
```sql
SELECT 
    platform,
    COUNT(*) as downloads,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM downloads), 2) as percentage
FROM downloads
WHERE download_status = 'completed'
GROUP BY platform;
```

### Get top countries:
```sql
SELECT 
    country_code,
    COUNT(*) as downloads
FROM downloads
WHERE download_status = 'completed'
GROUP BY country_code
ORDER BY downloads DESC
LIMIT 10;
```

### Calculate conversion rate:
```sql
SELECT 
    COUNT(DISTINCT session_id) as total_visitors,
    SUM(downloaded) as total_downloads,
    ROUND(SUM(downloaded) * 100.0 / COUNT(DISTINCT session_id), 2) as conversion_rate
FROM visitors;
```

---

## API Endpoints (Backend Implementation)

### POST /api/track-download
Track a new download initiation.

**Request Body:**
```json
{
  "platform": "android",
  "appVersion": "1.0.0",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "screenResolution": "1920x1080"
}
```

**Response:**
```json
{
  "success": true,
  "downloadId": 12345,
  "downloadUrl": "https://yoursite.com/downloads/StrayConnected.apk"
}
```

### POST /api/download-complete
Mark download as completed.

**Request Body:**
```json
{
  "downloadId": 12345
}
```

### GET /api/stats/summary
Get download statistics summary.

**Response:**
```json
{
  "totalDownloads": 10000,
  "androidDownloads": 6500,
  "iosDownloads": 3500,
  "todayDownloads": 150,
  "conversionRate": 12.5,
  "topCountries": [
    {"code": "US", "count": 3000},
    {"code": "GB", "count": 1500}
  ]
}
```

### POST /api/feedback
Submit user feedback.

**Request Body:**
```json
{
  "downloadId": 12345,
  "rating": 5,
  "feedbackText": "Great app!",
  "feedbackType": "general",
  "email": "user@example.com"
}
```

---

## Database Indexing Strategy

The schema includes strategic indexes to optimize common queries:

1. **Download tracking**: Indexed on platform, timestamp, and status
2. **Version management**: Indexed on active status and platform
3. **Analytics**: Indexed on date for time-series queries
4. **Visitors**: Indexed on session_id and visit timestamp

---

## Data Retention Policy

Recommended data retention:
- **downloads**: Keep for 2 years, then archive
- **visitors**: Keep for 1 year, then archive
- **error_logs**: Keep for 6 months, then delete
- **feedback**: Keep indefinitely (valuable user insights)
- **download_analytics**: Keep indefinitely (aggregated data is small)

---

## Security Considerations

1. **Hash IP addresses** for privacy compliance (GDPR)
2. **Encrypt sensitive data** in the database
3. **Use prepared statements** to prevent SQL injection
4. **Implement rate limiting** to prevent abuse
5. **Regular backups** of the database
6. **Use HTTPS** for all API endpoints
7. **Implement CORS** properly for API access

---

## Setup Instructions

1. Create the database:
```sql
CREATE DATABASE stray_connected_downloads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Run all CREATE TABLE statements in order

3. Insert initial admin user:
```sql
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@strayconnected.com', '$2b$10$...', 'Admin User', 'super_admin');
```

4. Insert initial app versions:
```sql
INSERT INTO app_versions (platform, version_number, version_code, file_name, file_size_mb, file_path, release_date, min_os_version, changelog)
VALUES 
('android', '1.0.0', 1, 'StrayConnected.apk', 45.0, '/downloads/StrayConnected.apk', '2025-12-17', '8.0', 'Initial release'),
('ios', '1.0.0', 1, 'StrayConnected.ipa', 45.0, '/downloads/StrayConnected.ipa', '2025-12-17', '13.0', 'Initial release');
```

---

## Technology Stack Recommendations

**Backend:**
- Node.js + Express.js
- PHP + Laravel
- Python + Flask/Django

**Database:**
- MySQL 8.0+
- PostgreSQL 12+
- MariaDB 10+

**Frontend Integration:**
- Update `script.js` to call your API endpoints
- Use fetch() or axios for API calls
- Handle authentication with JWT tokens

---

## Next Steps

1. ✅ Set up the database using the schema above
2. Create backend API endpoints
3. Connect frontend JavaScript to backend APIs
4. Implement admin dashboard for viewing statistics
5. Set up automated backups
6. Configure monitoring and alerts
7. Test the complete download flow
