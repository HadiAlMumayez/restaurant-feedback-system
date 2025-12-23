# Backup & Migration Guide

This document explains how to backup your Restaurant Feedback System data and prepare for potential database migrations.

## Overview

The system includes manual export capabilities for data backup and migration readiness. All exports respect RBAC (Role-Based Access Control):
- **Owners**: Can export all data (reviews, branches, admins)
- **Managers**: Can export only reviews and branches they have access to
- **Viewers**: Cannot export data

## Manual Export (Recommended)

### Accessing the Export Page

1. Log in as an owner or manager
2. Navigate to **Admin Dashboard → Backups**
3. You'll see export options for:
   - Reviews (JSON/CSV)
   - Branches (JSON)
   - Admins (JSON, owner only)

### Export Formats

#### Reviews Export
- **JSON**: Complete review data with all fields
- **CSV**: Tabular format for spreadsheet analysis
- Fields included:
  - `id`: Review document ID
  - `createdAt`: ISO 8601 timestamp
  - `branchId`: Branch reference
  - `rating`: 1-5 rating
  - `comment`: Customer comment (optional)
  - `customerName`: Customer name (optional)
  - `contact`: Email or phone (optional)
  - `billId`: Bill/receipt ID (optional)

#### Branches Export
- **JSON**: Complete branch data
- Fields included:
  - `id`: Branch document ID
  - `name`: Branch name
  - `location`: Location description
  - `address`: Full address (optional)
  - `isActive`: Active status
  - `createdAt`: ISO 8601 timestamp
  - `updatedAt`: ISO 8601 timestamp

#### Admins Export (Owner Only)
- **JSON**: Admin role and permission data
- Fields included:
  - `uid`: Firebase Auth UID
  - `role`: Admin role (owner/manager/viewer)
  - `branchIds`: Allowed branch IDs (null for owners)
  - `createdAt`: ISO 8601 timestamp
  - `updatedAt`: ISO 8601 timestamp

### Export Process

1. Click the export button for the data type you want
2. Wait for the export to complete (large datasets may take time)
3. The file will automatically download to your browser's download folder
4. Store the file securely (see Storage Recommendations below)

### Large Dataset Handling

- Exports automatically paginate through large datasets
- Safety limit: 100,000 records per export (prevents browser crashes)
- For datasets larger than 100K records, contact support for bulk export options

## Storage Recommendations

### Local Storage
- Store exports on a secure local drive
- Keep multiple copies (primary + backup)
- Encrypt sensitive data if storing on shared drives

### Cloud Storage
- **Google Drive**: Easy access, good for small-medium datasets
- **AWS S3**: Scalable, cost-effective for large datasets
- **Azure Blob Storage**: Enterprise-grade storage
- **Dropbox**: Simple file sharing and backup

### Backup Schedule

**Recommended**: Weekly exports
- Export reviews weekly (most frequently changing data)
- Export branches monthly (rarely changes)
- Export admins when roles change (infrequent)

## Automated Backup Options

### Option 1: Firebase Managed Exports (Recommended)

Firebase provides built-in export capabilities:

1. Go to **Firebase Console → Firestore Database**
2. Click **Export** tab
3. Configure export:
   - Select collections: `reviews`, `branches`, `admins`
   - Choose storage location (Cloud Storage bucket)
   - Set schedule (daily/weekly/monthly)
4. Exports are stored in Cloud Storage as JSON files

**Advantages**:
- No code required
- Automated scheduling
- Handles large datasets efficiently
- Built-in compression

**Setup Time**: ~10 minutes

### Option 2: Cloud Function Scheduled Export (Future)

For more control, you can create a Cloud Function that:
- Runs on a schedule (e.g., weekly)
- Exports data to Cloud Storage
- Sends notification when complete
- Handles pagination automatically

**Advantages**:
- Custom export logic
- Integration with other systems
- Automated notifications

**Setup Time**: ~2-4 hours (requires Cloud Functions setup)

## Migration Readiness

### Data Schema Versioning

All reviews include a `schemaVersion` field (currently version 1). This helps with future migrations:
- When migrating to a new database, check `schemaVersion`
- Apply appropriate transformations based on version
- Update schema version after migration

### Timestamp Consistency

- All timestamps are stored as Firestore Timestamps
- Exports convert timestamps to ISO 8601 strings
- This ensures compatibility with any database system

### Data Retention

The system includes a `dataRetentionDays` configuration placeholder (not yet implemented). Future versions may include:
- Automatic deletion of old reviews
- Configurable retention periods
- Archive before deletion

## Migration to Different Database

### Preparation

1. **Export all data** using the manual export feature
2. **Verify exports** by checking file sizes and record counts
3. **Store exports securely** in multiple locations
4. **Document your schema** (see export formats above)

### Migration Steps

1. **Set up new database** (Postgres, MySQL, etc.)
2. **Create tables** matching the export schema
3. **Import data** from JSON/CSV exports
4. **Verify data integrity** (count records, check relationships)
5. **Update application** to use new database
6. **Test thoroughly** before going live

### Repository Pattern

The system uses a repository pattern (`src/repositories/FeedbackRepository.ts`) that abstracts database operations. To migrate:

1. Create a new repository implementation (e.g., `PostgresFeedbackRepository.ts`)
2. Implement the `FeedbackRepository` interface
3. Update `RepositoryProvider` to use the new implementation
4. No UI changes required!

## Troubleshooting

### Export Fails or Times Out

- **Large datasets**: Try exporting in smaller date ranges
- **Network issues**: Check your internet connection
- **Browser limits**: Try a different browser or clear cache
- **Permission errors**: Verify you have export permissions (owner/manager)

### Missing Data in Export

- **RBAC filtering**: Managers only see data for allowed branches
- **Date filters**: Check if date range filters are applied
- **Empty collections**: Verify data exists in Firestore Console

### File Download Issues

- **Browser settings**: Check if downloads are blocked
- **File size**: Very large files may need to be split
- **Format issues**: Ensure JSON/CSV files open correctly

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firestore security rules allow exports
3. Contact system administrator for permission issues

## Best Practices

1. **Regular backups**: Export weekly, store securely
2. **Multiple locations**: Keep backups in 2+ locations
3. **Version control**: Name files with dates (e.g., `reviews-2025-01-15.json`)
4. **Test restores**: Periodically verify you can restore from backups
5. **Document changes**: Note any schema changes or data migrations

