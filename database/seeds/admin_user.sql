-- Default admin: admin@v-trinitysolutions.com / Admin@123
-- bcrypt hash of "Admin@123" with 12 rounds
USE EnterpriseCMS;
GO
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@v-trinitysolutions.com')
BEGIN
    INSERT INTO Users (RoleID, FirstName, LastName, Email, PasswordHash, IsVerified, IsActive)
    VALUES (1, 'Super', 'Admin', 'admin@v-trinitysolutions.com',
        '$2a$12$4McUTUto9VvuDVqcg3tq/upWv9qjHN8F8/SlhmKJLv5qWcRIY0qum',
        1, 1);
    PRINT 'Admin user created: admin@v-trinitysolutions.com / Admin@123';
END
ELSE
    PRINT 'Admin user already exists';
GO


