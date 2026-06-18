-- ============================================================
-- ENTERPRISE IT SOLUTIONS - COMPLETE DATABASE SCHEMA
-- Microsoft SQL Server 2019+
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EnterpriseCMS')
    CREATE DATABASE EnterpriseCMS
    COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

USE EnterpriseCMS;
GO

-- ============================================================
-- SECTION 1: USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE Roles (
    RoleID      INT IDENTITY(1,1) PRIMARY KEY,
    RoleName    NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    IsActive    BIT DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE Permissions (
    PermissionID   INT IDENTITY(1,1) PRIMARY KEY,
    PermissionKey  NVARCHAR(200) NOT NULL UNIQUE,  -- e.g. 'services.create'
    Module         NVARCHAR(100) NOT NULL,
    Description    NVARCHAR(500),
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE RolePermissions (
    RoleID       INT NOT NULL REFERENCES Roles(RoleID) ON DELETE CASCADE,
    PermissionID INT NOT NULL REFERENCES Permissions(PermissionID) ON DELETE CASCADE,
    GrantedAt    DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (RoleID, PermissionID)
);

CREATE TABLE Users (
    UserID        INT IDENTITY(1,1) PRIMARY KEY,
    RoleID        INT NOT NULL REFERENCES Roles(RoleID),
    FirstName     NVARCHAR(100) NOT NULL,
    LastName      NVARCHAR(100) NOT NULL,
    Email         NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(255) NOT NULL,
    Phone         NVARCHAR(30),
    Avatar        NVARCHAR(500),
    IsActive      BIT DEFAULT 1,
    IsVerified    BIT DEFAULT 0,
    LastLoginAt   DATETIME2,
    CreatedAt     DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE RefreshTokens (
    TokenID    INT IDENTITY(1,1) PRIMARY KEY,
    UserID     INT NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    Token      NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt  DATETIME2 NOT NULL,
    IsRevoked  BIT DEFAULT 0,
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE AuditLogs (
    LogID      BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID     INT REFERENCES Users(UserID),
    Action     NVARCHAR(200) NOT NULL,
    Module     NVARCHAR(100),
    EntityID   INT,
    OldValues  NVARCHAR(MAX),  -- JSON
    NewValues  NVARCHAR(MAX),  -- JSON
    IPAddress  NVARCHAR(45),
    UserAgent  NVARCHAR(500),
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 2: WEBSITE SETTINGS & CONFIGURATION
-- ============================================================

CREATE TABLE WebsiteSettings (
    SettingID    INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey   NVARCHAR(200) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX),
    SettingType  NVARCHAR(50) DEFAULT 'text',  -- text, image, json, boolean
    GroupName    NVARCHAR(100),
    Label        NVARCHAR(200),
    UpdatedBy    INT REFERENCES Users(UserID),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE SocialLinks (
    SocialID   INT IDENTITY(1,1) PRIMARY KEY,
    Platform   NVARCHAR(100) NOT NULL,
    URL        NVARCHAR(500) NOT NULL,
    Icon       NVARCHAR(200),
    SortOrder  INT DEFAULT 0,
    IsActive   BIT DEFAULT 1
);

CREATE TABLE OfficeLocations (
    LocationID  INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    Type        NVARCHAR(50) DEFAULT 'branch',  -- headquarters, branch
    Address     NVARCHAR(500),
    City        NVARCHAR(100),
    State       NVARCHAR(100),
    Country     NVARCHAR(100),
    Phone       NVARCHAR(30),
    Email       NVARCHAR(255),
    MapEmbed    NVARCHAR(MAX),
    Latitude    DECIMAL(10,8),
    Longitude   DECIMAL(11,8),
    IsActive    BIT DEFAULT 1,
    SortOrder   INT DEFAULT 0
);

-- ============================================================
-- SECTION 3: NAVIGATION & MENUS
-- ============================================================

CREATE TABLE Menus (
    MenuID     INT IDENTITY(1,1) PRIMARY KEY,
    MenuName   NVARCHAR(100) NOT NULL,
    Location   NVARCHAR(100) NOT NULL UNIQUE,  -- header, footer, etc.
    IsActive   BIT DEFAULT 1
);

CREATE TABLE MenuItems (
    ItemID      INT IDENTITY(1,1) PRIMARY KEY,
    MenuID      INT NOT NULL REFERENCES Menus(MenuID) ON DELETE CASCADE,
    ParentID    INT REFERENCES MenuItems(ItemID),
    Label       NVARCHAR(200) NOT NULL,
    URL         NVARCHAR(500),
    PageSlug    NVARCHAR(200),
    Icon        NVARCHAR(100),
    Target      NVARCHAR(20) DEFAULT '_self',
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

-- ============================================================
-- SECTION 4: SEO MANAGEMENT
-- ============================================================

CREATE TABLE SEOPages (
    SEOID           INT IDENTITY(1,1) PRIMARY KEY,
    PageSlug        NVARCHAR(300) NOT NULL UNIQUE,
    MetaTitle       NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    Keywords        NVARCHAR(500),
    OGTitle         NVARCHAR(200),
    OGDescription   NVARCHAR(500),
    OGImage         NVARCHAR(500),
    CanonicalURL    NVARCHAR(500),
    NoIndex         BIT DEFAULT 0,
    NoFollow        BIT DEFAULT 0,
    CustomSchema    NVARCHAR(MAX),  -- JSON-LD
    UpdatedAt       DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 5: MEDIA LIBRARY
-- ============================================================

CREATE TABLE MediaFolders (
    FolderID   INT IDENTITY(1,1) PRIMARY KEY,
    ParentID   INT REFERENCES MediaFolders(FolderID),
    Name       NVARCHAR(200) NOT NULL,
    Slug       NVARCHAR(200) NOT NULL,
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE MediaFiles (
    FileID      INT IDENTITY(1,1) PRIMARY KEY,
    FolderID    INT REFERENCES MediaFolders(FolderID),
    FileName    NVARCHAR(300) NOT NULL,
    OriginalName NVARCHAR(300) NOT NULL,
    MimeType    NVARCHAR(100),
    FileSize    BIGINT,
    FilePath    NVARCHAR(1000) NOT NULL,
    FileURL     NVARCHAR(1000) NOT NULL,
    AltText     NVARCHAR(300),
    Tags        NVARCHAR(500),
    UploadedBy  INT REFERENCES Users(UserID),
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 6: HOME PAGE SECTIONS
-- ============================================================

CREATE TABLE HeroBanners (
    BannerID    INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(300) NOT NULL,
    Subtitle    NVARCHAR(500),
    Description NVARCHAR(1000),
    ButtonText  NVARCHAR(100),
    ButtonURL   NVARCHAR(500),
    Button2Text NVARCHAR(100),
    Button2URL  NVARCHAR(500),
    ImageID     INT REFERENCES MediaFiles(FileID),
    VideoURL    NVARCHAR(500),
    BgColor     NVARCHAR(50),
    TextColor   NVARCHAR(50),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE SiteStatistics (
    StatID      INT IDENTITY(1,1) PRIMARY KEY,
    Label       NVARCHAR(200) NOT NULL,
    Value       NVARCHAR(100) NOT NULL,
    Suffix      NVARCHAR(50),
    Icon        NVARCHAR(100),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE WhyChooseUs (
    FeatureID   INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    Icon        NVARCHAR(100),
    ImageID     INT REFERENCES MediaFiles(FileID),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE Partners (
    PartnerID   INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    LogoID      INT REFERENCES MediaFiles(FileID),
    Website     NVARCHAR(500),
    Category    NVARCHAR(100),  -- technology, certification, alliance
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE Certifications (
    CertID      INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    IssuedBy    NVARCHAR(200),
    LogoID      INT REFERENCES MediaFiles(FileID),
    Year        INT,
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE Testimonials (
    TestimonialID INT IDENTITY(1,1) PRIMARY KEY,
    ClientName    NVARCHAR(200) NOT NULL,
    Designation   NVARCHAR(200),
    Company       NVARCHAR(200),
    Content       NVARCHAR(2000) NOT NULL,
    Rating        TINYINT DEFAULT 5,
    AvatarID      INT REFERENCES MediaFiles(FileID),
    IsActive      BIT DEFAULT 1,
    SortOrder     INT DEFAULT 0,
    CreatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 7: SERVICES
-- ============================================================

CREATE TABLE ServiceCategories (
    CategoryID  INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    Slug        NVARCHAR(200) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    Icon        NVARCHAR(100),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE Services (
    ServiceID      INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID     INT REFERENCES ServiceCategories(CategoryID),
    Title          NVARCHAR(300) NOT NULL,
    Slug           NVARCHAR(300) NOT NULL UNIQUE,
    ShortDesc      NVARCHAR(500),
    FullDesc       NVARCHAR(MAX),
    Icon           NVARCHAR(100),
    BannerID       INT REFERENCES MediaFiles(FileID),
    ThumbnailID    INT REFERENCES MediaFiles(FileID),
    SortOrder      INT DEFAULT 0,
    IsActive       BIT DEFAULT 1,
    IsFeatured     BIT DEFAULT 0,
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE ServiceGallery (
    GalleryID  INT IDENTITY(1,1) PRIMARY KEY,
    ServiceID  INT NOT NULL REFERENCES Services(ServiceID) ON DELETE CASCADE,
    FileID     INT NOT NULL REFERENCES MediaFiles(FileID),
    Caption    NVARCHAR(300),
    SortOrder  INT DEFAULT 0
);

CREATE TABLE ServiceDocuments (
    DocID       INT IDENTITY(1,1) PRIMARY KEY,
    ServiceID   INT NOT NULL REFERENCES Services(ServiceID) ON DELETE CASCADE,
    Title       NVARCHAR(300) NOT NULL,
    FileID      INT NOT NULL REFERENCES MediaFiles(FileID),
    SortOrder   INT DEFAULT 0
);

CREATE TABLE ServiceFAQs (
    FAQID      INT IDENTITY(1,1) PRIMARY KEY,
    ServiceID  INT NOT NULL REFERENCES Services(ServiceID) ON DELETE CASCADE,
    Question   NVARCHAR(500) NOT NULL,
    Answer     NVARCHAR(MAX) NOT NULL,
    SortOrder  INT DEFAULT 0
);

-- ============================================================
-- SECTION 8: SOLUTIONS
-- ============================================================

CREATE TABLE Solutions (
    SolutionID   INT IDENTITY(1,1) PRIMARY KEY,
    Title        NVARCHAR(300) NOT NULL,
    Slug         NVARCHAR(300) NOT NULL UNIQUE,
    ShortDesc    NVARCHAR(500),
    FullDesc     NVARCHAR(MAX),
    Icon         NVARCHAR(100),
    BannerID     INT REFERENCES MediaFiles(FileID),
    ThumbnailID  INT REFERENCES MediaFiles(FileID),
    KeyFeatures  NVARCHAR(MAX),  -- JSON array
    UseCases     NVARCHAR(MAX),  -- JSON array
    SortOrder    INT DEFAULT 0,
    IsActive     BIT DEFAULT 1,
    IsFeatured   BIT DEFAULT 0,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 9: INDUSTRIES
-- ============================================================

CREATE TABLE Industries (
    IndustryID   INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(200) NOT NULL,
    Slug         NVARCHAR(200) NOT NULL UNIQUE,
    Description  NVARCHAR(MAX),
    Icon         NVARCHAR(100),
    BannerID     INT REFERENCES MediaFiles(FileID),
    ThumbnailID  INT REFERENCES MediaFiles(FileID),
    SortOrder    INT DEFAULT 0,
    IsActive     BIT DEFAULT 1
);

-- ============================================================
-- SECTION 10: PROJECTS
-- ============================================================

CREATE TABLE Projects (
    ProjectID       INT IDENTITY(1,1) PRIMARY KEY,
    IndustryID      INT REFERENCES Industries(IndustryID),
    ProjectName     NVARCHAR(300) NOT NULL,
    Slug            NVARCHAR(300) NOT NULL UNIQUE,
    ClientName      NVARCHAR(200),
    Location        NVARCHAR(200),
    Description     NVARCHAR(MAX),
    Challenge       NVARCHAR(MAX),
    Solution        NVARCHAR(MAX),
    Results         NVARCHAR(MAX),
    Technologies    NVARCHAR(MAX),  -- JSON array
    ProjectValue    DECIMAL(18,2),
    Currency        NVARCHAR(10) DEFAULT 'USD',
    StartDate       DATE,
    CompletionDate  DATE,
    BannerID        INT REFERENCES MediaFiles(FileID),
    ThumbnailID     INT REFERENCES MediaFiles(FileID),
    IsFeatured      BIT DEFAULT 0,
    IsActive        BIT DEFAULT 1,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE ProjectGallery (
    GalleryID  INT IDENTITY(1,1) PRIMARY KEY,
    ProjectID  INT NOT NULL REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    FileID     INT NOT NULL REFERENCES MediaFiles(FileID),
    Caption    NVARCHAR(300),
    MediaType  NVARCHAR(20) DEFAULT 'image',  -- image, video
    SortOrder  INT DEFAULT 0
);

-- ============================================================
-- SECTION 11: CASE STUDIES
-- ============================================================

CREATE TABLE CaseStudies (
    CaseStudyID  INT IDENTITY(1,1) PRIMARY KEY,
    ProjectID    INT REFERENCES Projects(ProjectID),
    Title        NVARCHAR(300) NOT NULL,
    Slug         NVARCHAR(300) NOT NULL UNIQUE,
    Client       NVARCHAR(200),
    Industry     NVARCHAR(200),
    Challenge    NVARCHAR(MAX),
    Solution     NVARCHAR(MAX),
    Results      NVARCHAR(MAX),
    Metrics      NVARCHAR(MAX),  -- JSON
    BannerID     INT REFERENCES MediaFiles(FileID),
    ThumbnailID  INT REFERENCES MediaFiles(FileID),
    IsActive     BIT DEFAULT 1,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 12: BLOG
-- ============================================================

CREATE TABLE BlogCategories (
    CategoryID  INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    Slug        NVARCHAR(200) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    IsActive    BIT DEFAULT 1
);

CREATE TABLE BlogTags (
    TagID  INT IDENTITY(1,1) PRIMARY KEY,
    Name   NVARCHAR(100) NOT NULL,
    Slug   NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE BlogPosts (
    PostID        INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID    INT REFERENCES BlogCategories(CategoryID),
    AuthorID      INT NOT NULL REFERENCES Users(UserID),
    Title         NVARCHAR(300) NOT NULL,
    Slug          NVARCHAR(300) NOT NULL UNIQUE,
    Excerpt       NVARCHAR(500),
    Content       NVARCHAR(MAX) NOT NULL,
    FeaturedImgID INT REFERENCES MediaFiles(FileID),
    Status        NVARCHAR(20) DEFAULT 'draft',  -- draft, published, scheduled
    PublishAt     DATETIME2,
    ViewCount     INT DEFAULT 0,
    IsFeatured    BIT DEFAULT 0,
    AllowComments BIT DEFAULT 1,
    CreatedAt     DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE BlogPostTags (
    PostID INT NOT NULL REFERENCES BlogPosts(PostID) ON DELETE CASCADE,
    TagID  INT NOT NULL REFERENCES BlogTags(TagID) ON DELETE CASCADE,
    PRIMARY KEY (PostID, TagID)
);

CREATE TABLE BlogComments (
    CommentID   INT IDENTITY(1,1) PRIMARY KEY,
    PostID      INT NOT NULL REFERENCES BlogPosts(PostID) ON DELETE CASCADE,
    ParentID    INT REFERENCES BlogComments(CommentID),
    AuthorName  NVARCHAR(200) NOT NULL,
    AuthorEmail NVARCHAR(255) NOT NULL,
    Content     NVARCHAR(2000) NOT NULL,
    Status      NVARCHAR(20) DEFAULT 'pending',  -- pending, approved, spam
    IPAddress   NVARCHAR(45),
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 13: CAREERS
-- ============================================================

CREATE TABLE JobDepartments (
    DepartmentID INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(200) NOT NULL,
    IsActive     BIT DEFAULT 1
);

CREATE TABLE JobListings (
    JobID          INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentID   INT REFERENCES JobDepartments(DepartmentID),
    Title          NVARCHAR(300) NOT NULL,
    Slug           NVARCHAR(300) NOT NULL UNIQUE,
    Location       NVARCHAR(200),
    JobType        NVARCHAR(50),  -- full-time, part-time, contract, remote
    ExperienceMin  INT,
    ExperienceMax  INT,
    Salary         NVARCHAR(200),
    Description    NVARCHAR(MAX),
    Requirements   NVARCHAR(MAX),
    Benefits       NVARCHAR(MAX),
    Status         NVARCHAR(20) DEFAULT 'active',  -- active, closed, draft
    ExpiresAt      DATE,
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE JobApplications (
    ApplicationID  INT IDENTITY(1,1) PRIMARY KEY,
    JobID          INT NOT NULL REFERENCES JobListings(JobID),
    FullName       NVARCHAR(200) NOT NULL,
    Email          NVARCHAR(255) NOT NULL,
    Phone          NVARCHAR(30),
    CurrentCompany NVARCHAR(200),
    CurrentRole    NVARCHAR(200),
    Experience     INT,
    CoverLetter    NVARCHAR(MAX),
    ResumeFileID   INT REFERENCES MediaFiles(FileID),
    LinkedInURL    NVARCHAR(500),
    Status         NVARCHAR(50) DEFAULT 'new',  -- new, screening, interview, offer, rejected, hired
    Notes          NVARCHAR(MAX),
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 14: INQUIRIES (CONTRACT WORK)
-- ============================================================

CREATE TABLE Inquiries (
    InquiryID      INT IDENTITY(1,1) PRIMARY KEY,
    InquiryType    NVARCHAR(100) NOT NULL,  -- CCTV, Cyber Security, SOC, etc.
    Name           NVARCHAR(200) NOT NULL,
    Company        NVARCHAR(200),
    Phone          NVARCHAR(30) NOT NULL,
    Email          NVARCHAR(255) NOT NULL,
    Location       NVARCHAR(200),
    ProjectType    NVARCHAR(200),
    Budget         NVARCHAR(100),
    Description    NVARCHAR(MAX) NOT NULL,
    AttachmentID   INT REFERENCES MediaFiles(FileID),
    Status         NVARCHAR(50) DEFAULT 'new',  -- new, in_progress, quotation_sent, won, lost
    AssignedTo     INT REFERENCES Users(UserID),
    Notes          NVARCHAR(MAX),
    IPAddress      NVARCHAR(45),
    Source         NVARCHAR(100),  -- website, referral, etc.
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE InquiryNotes (
    NoteID     INT IDENTITY(1,1) PRIMARY KEY,
    InquiryID  INT NOT NULL REFERENCES Inquiries(InquiryID) ON DELETE CASCADE,
    UserID     INT NOT NULL REFERENCES Users(UserID),
    Note       NVARCHAR(MAX) NOT NULL,
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 15: CONTACT FORMS
-- ============================================================

CREATE TABLE ContactSubmissions (
    SubmissionID  INT IDENTITY(1,1) PRIMARY KEY,
    Name          NVARCHAR(200) NOT NULL,
    Email         NVARCHAR(255) NOT NULL,
    Phone         NVARCHAR(30),
    Subject       NVARCHAR(300),
    Message       NVARCHAR(MAX) NOT NULL,
    Status        NVARCHAR(30) DEFAULT 'unread',  -- unread, read, replied
    IPAddress     NVARCHAR(45),
    CreatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 16: CUSTOMER PORTAL
-- ============================================================

CREATE TABLE Customers (
    CustomerID   INT IDENTITY(1,1) PRIMARY KEY,
    UserID       INT NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    CompanyName  NVARCHAR(300),
    AccountCode  NVARCHAR(50) UNIQUE,
    Address      NVARCHAR(500),
    City         NVARCHAR(100),
    Country      NVARCHAR(100),
    IsActive     BIT DEFAULT 1,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE Quotations (
    QuotationID    INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID     INT NOT NULL REFERENCES Customers(CustomerID),
    InquiryID      INT REFERENCES Inquiries(InquiryID),
    QuotationNo    NVARCHAR(50) NOT NULL UNIQUE,
    Title          NVARCHAR(300),
    Amount         DECIMAL(18,2),
    Currency       NVARCHAR(10) DEFAULT 'USD',
    ValidUntil     DATE,
    Status         NVARCHAR(50) DEFAULT 'sent',  -- sent, accepted, rejected, expired
    FileID         INT REFERENCES MediaFiles(FileID),
    Notes          NVARCHAR(MAX),
    CreatedAt      DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt      DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE CustomerProjects (
    CProjID      INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID   INT NOT NULL REFERENCES Customers(CustomerID),
    ProjectID    INT REFERENCES Projects(ProjectID),
    Name         NVARCHAR(300) NOT NULL,
    Status       NVARCHAR(100) DEFAULT 'planning',  -- planning, in_progress, completed, on_hold
    StartDate    DATE,
    EndDate      DATE,
    Progress     TINYINT DEFAULT 0,  -- 0-100
    Description  NVARCHAR(MAX),
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE CustomerDocuments (
    DocID        INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID   INT NOT NULL REFERENCES Customers(CustomerID),
    Title        NVARCHAR(300) NOT NULL,
    Category     NVARCHAR(100),  -- invoice, contract, report, manual
    FileID       INT NOT NULL REFERENCES MediaFiles(FileID),
    IsVisible    BIT DEFAULT 1,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE SupportTickets (
    TicketID     INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID   INT NOT NULL REFERENCES Customers(CustomerID),
    AssignedTo   INT REFERENCES Users(UserID),
    Subject      NVARCHAR(300) NOT NULL,
    Description  NVARCHAR(MAX) NOT NULL,
    Priority     NVARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical
    Status       NVARCHAR(30) DEFAULT 'open',    -- open, in_progress, resolved, closed
    Category     NVARCHAR(100),
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE TicketReplies (
    ReplyID    INT IDENTITY(1,1) PRIMARY KEY,
    TicketID   INT NOT NULL REFERENCES SupportTickets(TicketID) ON DELETE CASCADE,
    UserID     INT NOT NULL REFERENCES Users(UserID),
    Message    NVARCHAR(MAX) NOT NULL,
    IsInternal BIT DEFAULT 0,  -- internal note vs customer-visible
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE AMCContracts (
    AMCID         INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID    INT NOT NULL REFERENCES Customers(CustomerID),
    ContractNo    NVARCHAR(50) UNIQUE,
    Description   NVARCHAR(MAX),
    StartDate     DATE NOT NULL,
    EndDate       DATE NOT NULL,
    Amount        DECIMAL(18,2),
    Status        NVARCHAR(30) DEFAULT 'active',  -- active, expired, cancelled
    FileID        INT REFERENCES MediaFiles(FileID),
    CreatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================================
-- SECTION 17: ABOUT PAGE
-- ============================================================

CREATE TABLE TeamMembers (
    MemberID    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    Designation NVARCHAR(200),
    Department  NVARCHAR(200),
    Bio         NVARCHAR(MAX),
    PhotoID     INT REFERENCES MediaFiles(FileID),
    LinkedIn    NVARCHAR(500),
    Email       NVARCHAR(255),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

CREATE TABLE CompanyTimeline (
    EventID   INT IDENTITY(1,1) PRIMARY KEY,
    Year      INT NOT NULL,
    Title     NVARCHAR(300) NOT NULL,
    Content   NVARCHAR(MAX),
    ImageID   INT REFERENCES MediaFiles(FileID),
    SortOrder INT DEFAULT 0,
    IsActive  BIT DEFAULT 1
);

CREATE TABLE Awards (
    AwardID     INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(300) NOT NULL,
    IssuedBy    NVARCHAR(200),
    Year        INT,
    Description NVARCHAR(MAX),
    ImageID     INT REFERENCES MediaFiles(FileID),
    SortOrder   INT DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

-- ============================================================
-- SECTION 18: EMAIL NOTIFICATIONS
-- ============================================================

CREATE TABLE EmailTemplates (
    TemplateID   INT IDENTITY(1,1) PRIMARY KEY,
    TemplateKey  NVARCHAR(100) NOT NULL UNIQUE,
    Subject      NVARCHAR(300) NOT NULL,
    Body         NVARCHAR(MAX) NOT NULL,
    Variables    NVARCHAR(500),  -- comma-separated variable names
    IsActive     BIT DEFAULT 1,
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE EmailQueue (
    QueueID     BIGINT IDENTITY(1,1) PRIMARY KEY,
    ToEmail     NVARCHAR(255) NOT NULL,
    ToName      NVARCHAR(200),
    Subject     NVARCHAR(300) NOT NULL,
    Body        NVARCHAR(MAX) NOT NULL,
    Status      NVARCHAR(20) DEFAULT 'pending',  -- pending, sent, failed
    Attempts    TINYINT DEFAULT 0,
    SentAt      DATETIME2,
    Error       NVARCHAR(500),
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

GO

