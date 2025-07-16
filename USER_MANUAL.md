# Hotel Meal Record System – User Manual

Welcome to the Hotel Meal Record System! This guide will help you use the application to track and manage daily meals for your team or staff.

---

## Table of Contents

1. [Accessing the App](#accessing-the-app)
2. [Main Dashboard](#main-dashboard)
3. [Adding a Team Member](#adding-a-team-member)
4. [Removing a Team Member](#removing-a-team-member)
5. [Selecting Meals](#selecting-meals)
6. [Viewing Meal History](#viewing-meal-history)
7. [Viewing Statistics](#viewing-statistics)
8. [Database Viewer & Export](#database-viewer--export)
9. [Troubleshooting](#troubleshooting)

---

## Accessing the App

- Open your browser and go to [http://localhost:3000](http://localhost:3000) (or your deployed URL).

---

## Main Dashboard

- The dashboard shows all team members and their meal status for the selected day.
- Use the **calendar** at the top to change the date.
- The **summary panel** shows daily and weekly totals, meal counts, and averages.

---

## Adding a Team Member

1. Click the **"Add New Member"** button at the top right.
2. Enter the member's **full name** and a **unique employee ID** (e.g., EMP004).
3. Click **"Add Member"**. The new member will appear in the list.

---

## Removing a Team Member

1. Find the member you want to remove.
2. Click the **❌ (remove)** button on their card.
3. The member will be deleted from the system.

---

## Selecting Meals

1. Find the member for whom you want to record a meal.
2. Click the **🍗 (Chicken)** or **🥗 (Vegetarian)** button for today.
   - Click again to deselect (no meal).
3. The meal and cost will be saved and reflected in the summary.

---

## Viewing Meal History

1. Click on any member's card.
2. You will see their **complete meal history**, including dates, meal types, and costs.
3. Click **"Back to Dashboard"** to return.

---

## Viewing Statistics

- The **summary panel** (top of dashboard) shows:
  - Today's total cost
  - Weekly total cost
  - Number of chicken and vegetarian meals today
- The **quick stats** (bottom) show:
  - Total team members
  - Meals ordered today
  - Daily average cost per member

---

## Database Viewer & Export

1. Click **"View Database"** in the dashboard header.
2. You will see two modes:
   - **Data Viewer**: Formatted stats, all members, and meal records.
   - **Raw Data**: Raw database records, with an **Export JSON** button to download all data.
3. Switch between views using the buttons at the top right.

---

## Troubleshooting

- **Can't add or remove members?**
  - Make sure all fields are filled and the employee ID is unique.
- **Data not saving?**
  - Refresh the page. If the problem persists, contact your administrator.
- **Database errors?**
  - Ensure the server is running and the database is set up (see README).
- **Need to reset everything?**
  - Ask your admin to reset the database (see README for instructions).

---

## Need Help?

Contact your system administrator or developer for further assistance.
