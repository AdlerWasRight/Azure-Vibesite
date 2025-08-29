-- Step 1: Add the community column to the posts table (Azure SQL Server Syntax)
IF COL_LENGTH('posts', 'community') IS NULL
BEGIN
    ALTER TABLE posts
    ADD community VARCHAR(50) NULL
        CONSTRAINT DF_posts_community DEFAULT '/gen/';
    PRINT 'Column "community" added with default constraint DF_posts_community.';
END
ELSE
BEGIN
    PRINT 'Column "community" already exists.';
END
GO

-- Optional: Make column NOT NULL after populating existing rows
-- UPDATE posts SET community = '/gen/' WHERE community IS NULL;
-- ALTER TABLE posts ALTER COLUMN community VARCHAR(50) NOT NULL;
-- GO

-- Step 2: Assign '/test/' community to posts with IDs 1,2,3
UPDATE posts
SET community = '/test/'
WHERE id IN (1, 2, 3);
GO

-- Verification: List updated records
SELECT id, title, community
FROM posts
WHERE id IN (1, 2, 3) OR community IS NOT NULL
ORDER BY id;
GO
