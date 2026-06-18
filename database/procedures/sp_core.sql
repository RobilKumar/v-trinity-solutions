-- ============================================================
-- STORED PROCEDURES
-- ============================================================

USE EnterpriseCMS;
GO

-- Get paginated list with total count
CREATE OR ALTER PROCEDURE sp_GetPaginated
    @TableQuery NVARCHAR(MAX),
    @Page       INT = 1,
    @PageSize   INT = 20,
    @OrderBy    NVARCHAR(200) = 'CreatedAt DESC'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @SQL NVARCHAR(MAX) = @TableQuery +
        ' ORDER BY ' + @OrderBy +
        ' OFFSET ' + CAST(@Offset AS NVARCHAR) +
        ' ROWS FETCH NEXT ' + CAST(@PageSize AS NVARCHAR) + ' ROWS ONLY';
    EXEC sp_executesql @SQL;
END
GO

-- Upsert SEO Page
CREATE OR ALTER PROCEDURE sp_UpsertSEO
    @PageSlug       NVARCHAR(300),
    @MetaTitle      NVARCHAR(200),
    @MetaDesc       NVARCHAR(500),
    @Keywords       NVARCHAR(500),
    @OGTitle        NVARCHAR(200),
    @OGDesc         NVARCHAR(500),
    @OGImage        NVARCHAR(500),
    @CanonicalURL   NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM SEOPages WHERE PageSlug = @PageSlug)
        UPDATE SEOPages SET
            MetaTitle       = @MetaTitle,
            MetaDescription = @MetaDesc,
            Keywords        = @Keywords,
            OGTitle         = @OGTitle,
            OGDescription   = @OGDesc,
            OGImage         = @OGImage,
            CanonicalURL    = @CanonicalURL,
            UpdatedAt       = GETUTCDATE()
        WHERE PageSlug = @PageSlug;
    ELSE
        INSERT INTO SEOPages (PageSlug, MetaTitle, MetaDescription, Keywords, OGTitle, OGDescription, OGImage, CanonicalURL)
        VALUES (@PageSlug, @MetaTitle, @MetaDesc, @Keywords, @OGTitle, @OGDesc, @OGImage, @CanonicalURL);
END
GO

-- Log audit action
CREATE OR ALTER PROCEDURE sp_LogAudit
    @UserID    INT,
    @Action    NVARCHAR(200),
    @Module    NVARCHAR(100),
    @EntityID  INT,
    @OldValues NVARCHAR(MAX),
    @NewValues NVARCHAR(MAX),
    @IPAddress NVARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AuditLogs (UserID, Action, Module, EntityID, OldValues, NewValues, IPAddress)
    VALUES (@UserID, @Action, @Module, @EntityID, @OldValues, @NewValues, @IPAddress);
END
GO

-- Dashboard statistics
CREATE OR ALTER PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Inquiries WHERE Status = 'new')                          AS NewInquiries,
        (SELECT COUNT(*) FROM Inquiries WHERE CAST(CreatedAt AS DATE) = CAST(GETUTCDATE() AS DATE)) AS TodayInquiries,
        (SELECT COUNT(*) FROM ContactSubmissions WHERE Status = 'unread')              AS UnreadContacts,
        (SELECT COUNT(*) FROM JobApplications WHERE Status = 'new')                    AS NewApplications,
        (SELECT COUNT(*) FROM SupportTickets WHERE Status = 'open')                    AS OpenTickets,
        (SELECT COUNT(*) FROM BlogComments WHERE Status = 'pending')                   AS PendingComments,
        (SELECT COUNT(*) FROM Users WHERE IsActive = 1)                                AS ActiveUsers,
        (SELECT COUNT(*) FROM Projects WHERE IsActive = 1)                             AS TotalProjects;

    -- Recent inquiries
    SELECT TOP 10
        i.InquiryID, i.Name, i.Company, i.InquiryType, i.Status, i.CreatedAt
    FROM Inquiries i
    ORDER BY i.CreatedAt DESC;

    -- Inquiry status breakdown
    SELECT Status, COUNT(*) AS Count
    FROM Inquiries
    GROUP BY Status;
END
GO

-- Generate sitemap data
CREATE OR ALTER PROCEDURE sp_GetSitemapData
AS
BEGIN
    SET NOCOUNT ON;
    -- Services
    SELECT 'service' AS Type, Slug, UpdatedAt FROM Services WHERE IsActive = 1;
    -- Solutions
    SELECT 'solution' AS Type, Slug, UpdatedAt FROM Solutions WHERE IsActive = 1;
    -- Projects
    SELECT 'project' AS Type, Slug, UpdatedAt FROM Projects WHERE IsActive = 1;
    -- Blog Posts
    SELECT 'blog' AS Type, Slug, UpdatedAt FROM BlogPosts WHERE Status = 'published';
    -- Industries
    SELECT 'industry' AS Type, Slug, NULL AS UpdatedAt FROM Industries WHERE IsActive = 1;
    -- Jobs
    SELECT 'job' AS Type, Slug, UpdatedAt FROM JobListings WHERE Status = 'active';
END
GO

PRINT 'Stored procedures created.';
