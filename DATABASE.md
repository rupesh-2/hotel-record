# Database Setup and Usage

This document explains how to set up and use the database for the Meal Tracker application.

## Database Overview

The application uses **SQLite** as the database with **Prisma ORM** for data management. The database stores:

- **Team Members**: Employee information (ID, name, creation date)
- **Meal Entries**: Daily meal selections (date, type, cost, member reference)

## Database Schema

### TeamMember Table

```sql
- id: String (Primary Key, auto-generated)
- employeeId: String (Unique)
- name: String
- createdAt: DateTime
- updatedAt: DateTime
```

### MealEntry Table

```sql
- id: String (Primary Key, auto-generated)
- date: String (YYYY-MM-DD format)
- type: Enum (CHICKEN, VEG, null)
- cost: Integer
- teamMemberId: String (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Create Database Tables

```bash
npx prisma db push
```

### 5. Seed Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

## Database Operations

### API Endpoints

#### Team Members

- `GET /api/team-members` - Get all team members
- `POST /api/team-members` - Create new team member
- `DELETE /api/team-members/[id]` - Delete team member

#### Meals

- `GET /api/meals?date=YYYY-MM-DD` - Get daily totals
- `POST /api/meals` - Update meal entry

### Database Functions

The application provides helper functions in `src/lib/db.ts`:

- `getAllTeamMembers()` - Fetch all team members with meals
- `createTeamMember(employeeId, name)` - Create new team member
- `deleteTeamMember(id)` - Delete team member
- `updateMealEntry(teamMemberId, date, type, cost)` - Update meal entry
- `getDailyTotals(date)` - Get daily statistics
- `getWeeklyTotals(startDate, endDate)` - Get weekly totals

## Database Viewer

The application includes a comprehensive database viewer accessible at `/database` with two modes:

### 1. Data Viewer

- Displays formatted statistics and member information
- Shows meal history and spending patterns
- Provides overview of all data

### 2. Raw Data Browser

- Shows raw database records
- Allows export of data as JSON
- Displays database information

## Database File

The SQLite database is stored as `dev.db` in the project root. This file contains all the data and can be:

- **Backed up** by copying the file
- **Restored** by replacing the file
- **Inspected** using SQLite tools like DB Browser for SQLite

## Development Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Seed database with sample data
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Data Export

You can export data in several ways:

1. **JSON Export**: Use the "Export JSON" button in the Raw Data browser
2. **Prisma Studio**: Run `npx prisma studio` for a web-based database interface
3. **Direct SQLite**: Use SQLite tools to query the `dev.db` file directly

## Backup and Restore

### Backup

```bash
cp dev.db dev.db.backup
```

### Restore

```bash
cp dev.db.backup dev.db
```

## Troubleshooting

### Common Issues

1. **Database not found**: Ensure `.env` file exists with correct DATABASE_URL
2. **Schema errors**: Run `npx prisma generate` and `npx prisma db push`
3. **Permission errors**: Check file permissions for `dev.db`
4. **Data not loading**: Verify API routes are working and database is seeded

### Reset Database

If you need to start fresh:

```bash
rm dev.db
npx prisma db push
npm run seed
```

## Production Considerations

For production deployment:

1. **Use a production database** like PostgreSQL or MySQL
2. **Set up proper environment variables**
3. **Implement database migrations** instead of `db push`
4. **Set up regular backups**
5. **Configure connection pooling**

Example production DATABASE_URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mealtracker"
```
