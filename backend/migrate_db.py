import sqlite3
import os

# Path to the database file
# In Docker, WORKDIR is /app, and db is at /app/db/geek_gifts.db
DB_PATH = os.path.join("db", "geek_gifts.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    columns_to_add = [
        ("requestor_contact", "VARCHAR"),
        ("client_contact", "VARCHAR"),
        ("due_date", "DATETIME"),
        # New columns for refactor
        ("organization_name", "VARCHAR"),
        ("request_date", "DATETIME"),
        ("receipt_id", "VARCHAR"),
        ("pickup_date", "DATETIME"),
        ("computer_model", "VARCHAR"),
        ("computer_type", "VARCHAR"),
        ("computer_price", "VARCHAR")
    ]
    
    # Also migrate comments table
    comments_columns = [
        ("author", "VARCHAR")
    ]

    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column {col_name} to requests...")
            cursor.execute(f"ALTER TABLE requests ADD COLUMN {col_name} {col_type}")
            print(f"Successfully added {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists. Skipping.")
            else:
                print(f"Error adding {col_name}: {e}")
                
    for col_name, col_type in comments_columns:
        try:
            print(f"Adding column {col_name} to comments...")
            cursor.execute(f"ALTER TABLE comments ADD COLUMN {col_name} {col_type}")
            print(f"Successfully added {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists. Skipping.")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
