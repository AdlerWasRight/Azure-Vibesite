-- Combined Database Schema for Aegis R&D Terminal (MSSQL / Azure SQL)

-- ======================================
-- Schema originally from schema_users.sql
-- ======================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(60) NOT NULL, -- Changed to password_hash for bcrypt
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE() -- Added updated_at for password changes etc.
    );
    PRINT 'Table Users created.';
END
ELSE
BEGIN
    -- Optional: Add checks/alter statements if the table exists but needs columns
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'role')
    BEGIN
        ALTER TABLE Users ADD role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
        PRINT 'Column role added to Users table.';
    END
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'updated_at')
    BEGIN
        ALTER TABLE Users ADD updated_at DATETIME2 DEFAULT GETDATE();
        PRINT 'Column updated_at added to Users table.';
    END
    -- Check for the new password_hash column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'password_hash')
    BEGIN
        ALTER TABLE Users ADD password_hash NVARCHAR(60) NULL; -- Add as NULL initially for existing tables
        PRINT 'Column password_hash added to Users table (initially NULL). Ensure existing users have hashes generated.';
    END
    -- Check for the old plain-text password column and warn if it exists
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'password')
    BEGIN
        PRINT 'WARNING: Obsolete ''password'' column found in Users table. Consider dropping it after migrating to password_hash.';
        -- Optionally, you could drop it here, but be careful with existing data:
        -- ALTER TABLE Users DROP COLUMN password;
        -- PRINT 'Obsolete ''password'' column dropped from Users table.';
    END
    PRINT 'Table Users already exists, columns checked/added.';
END
GO

-- ======================================
-- Schema originally from schema.sql
-- (Excluding redundant Users/Passwords tables)
-- ======================================

-- Create Posts Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Posts')
BEGIN
    CREATE TABLE Posts (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        community VARCHAR(50) NULL CONSTRAINT DF_posts_community DEFAULT '/gen/', -- << Added community string column with default
        title NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL, -- Use NVARCHAR(MAX) for long text in MSSQL
        image_url NVARCHAR(2048) NULL, -- New image URL column
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION -- Cascade changed to NO ACTION
    );
    PRINT 'Table Posts created.';
END
ELSE
BEGIN
    -- Add image_url column if missing
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME = 'image_url')
    BEGIN
        ALTER TABLE Posts ADD image_url NVARCHAR(2048) NULL;
        PRINT 'Column image_url added to Posts table.';
    END
    -- Add community string column if missing
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME = 'community')
    BEGIN
        ALTER TABLE Posts ADD community VARCHAR(50) NULL;
        PRINT 'Column community (VARCHAR(50)) added to Posts table.';
    END
    -- Add default constraint if missing
    IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE name = 'DF_posts_community' AND parent_object_id = OBJECT_ID('Posts'))
    BEGIN
        ALTER TABLE Posts
        ADD CONSTRAINT DF_posts_community DEFAULT '/gen/' FOR community;
        PRINT 'Default constraint DF_posts_community added for community column in Posts table.';
    END
    PRINT 'Table Posts already exists.';
END
GO

-- Create Comments Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Comments')
BEGIN
    CREATE TABLE Comments (
        id INT PRIMARY KEY IDENTITY(1,1),
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        comment_text NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION -- Cascade changed to NO ACTION
    );
    PRINT 'Table Comments created.';
END
ELSE
    PRINT 'Table Comments already exists.';
GO

-- Create Replies Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Replies')
BEGIN
    CREATE TABLE Replies (
        id INT PRIMARY KEY IDENTITY(1,1),
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        reply_text NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (comment_id) REFERENCES Comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION -- Cascade changed to NO ACTION
    );
    PRINT 'Table Replies created.';
END
ELSE
    PRINT 'Table Replies already exists.';
GO

-- Optional: Create an initial admin user (replace placeholders)
/*
IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'admin')
BEGIN
    -- Generate a hash for your desired admin password using bcrypt separately
    DECLARE @AdminPasswordHash NVARCHAR(255) = 'YOUR_PRE_GENERATED_BCRYPT_HASH'; -- Replace this!

    -- Check if password_hash column exists before inserting
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'password_hash')
    BEGIN
        INSERT INTO Users (username, email, password_hash, role)
        VALUES ('admin', 'admin@example.com', @AdminPasswordHash, 'admin');
        PRINT 'Initial admin user created.';
    END
    ELSE
    BEGIN
        PRINT 'Cannot create admin user, password_hash column missing.';
    END
END
*/

PRINT 'Combined schema setup script completed.';
GO 