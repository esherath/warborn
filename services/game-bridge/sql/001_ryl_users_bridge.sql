USE [RYL_Users];
GO

IF OBJECT_ID(N'dbo.WebRegisterAccount', N'P') IS NULL
  EXEC(N'CREATE PROCEDURE dbo.WebRegisterAccount AS SELECT 1 AS placeholder;');
GO

ALTER PROCEDURE dbo.WebRegisterAccount
  @AccountId varchar(24),
  @Nickname varchar(20),
  @Email varchar(50),
  @Password varchar(72)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  SET @AccountId = LTRIM(RTRIM(@AccountId));
  SET @Nickname = LTRIM(RTRIM(@Nickname));
  SET @Email = LTRIM(RTRIM(@Email));

  IF LEN(@AccountId) < 4 OR @AccountId LIKE '%[^0-9A-Za-z_]%' OR
     LEN(@Nickname) < 3 OR LEN(@Email) < 3 OR CHARINDEX('@', @Email) = 0 OR
     LEN(@Password) < 8
  BEGIN
    SELECT CAST(0 AS bit) AS success, 'invalid_fields' AS error_message;
    RETURN 1;
  END;

  DECLARE @PasswordHash varchar(32) = LOWER(CONVERT(varchar(32), HASHBYTES('MD5', @Password), 2));
  DECLARE @Uid int;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (
      SELECT 1 FROM dbo.usertbl WITH (UPDLOCK, HOLDLOCK)
      WHERE account = @AccountId
    )
    BEGIN
      ROLLBACK TRANSACTION;
      SELECT CAST(0 AS bit) AS success, 'account_exists' AS error_message;
      RETURN 2;
    END;

    SELECT @Uid = ISNULL(MAX(uid), 0) + 1
    FROM dbo.usertbl WITH (UPDLOCK, HOLDLOCK);

    INSERT dbo.usertbl (uid, account, passwd, writer, email, passwdType, block)
    VALUES (@Uid, @AccountId, @PasswordHash, @Nickname, @Email, 0, 0);

    COMMIT TRANSACTION;

    SELECT
      CAST(1 AS bit) AS success,
      CONVERT(varchar(20), @Uid) AS game_account_id,
      @AccountId AS account_id,
      @Nickname AS nickname,
      @Email AS email;
    RETURN 0;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.WebAuthenticateAccount', N'P') IS NULL
  EXEC(N'CREATE PROCEDURE dbo.WebAuthenticateAccount AS SELECT 1 AS placeholder;');
GO

ALTER PROCEDURE dbo.WebAuthenticateAccount
  @AccountId varchar(24),
  @Password varchar(72)
AS
BEGIN
  SET NOCOUNT ON;

  SET @AccountId = LTRIM(RTRIM(@AccountId));

  DECLARE @Uid int;
  DECLARE @CanonicalAccount varchar(40);
  DECLARE @StoredPassword varchar(40);
  DECLARE @PasswordType tinyint;
  DECLARE @CandidatePassword varchar(40) = LOWER(CONVERT(varchar(32), HASHBYTES('MD5', @Password), 2));

  SELECT TOP (1)
    @Uid = uid,
    @CanonicalAccount = account,
    @StoredPassword = passwd,
    @PasswordType = passwdType
  FROM dbo.usertbl
  WHERE account = @AccountId AND block = 0;

  IF @Uid IS NULL
  BEGIN
    SELECT CAST(0 AS bit) AS authenticated;
    RETURN 1;
  END;

  IF @PasswordType = 1
    EXEC dbo.PasswdChange @CanonicalAccount, @CandidatePassword, @CandidatePassword OUTPUT;

  IF @StoredPassword <> @CandidatePassword
  BEGIN
    SELECT CAST(0 AS bit) AS authenticated;
    RETURN 1;
  END;

  UPDATE dbo.usertbl SET lastlogin = GETDATE() WHERE uid = @Uid;

  SELECT
    CAST(1 AS bit) AS authenticated,
    CONVERT(varchar(20), uid) AS game_account_id,
    account AS account_id,
    COALESCE(NULLIF(writer COLLATE DATABASE_DEFAULT, ''), account) AS nickname,
    COALESCE(NULLIF(email COLLATE DATABASE_DEFAULT, ''), account + '@legacy.warborn.local') AS email
  FROM dbo.usertbl
  WHERE uid = @Uid;
  RETURN 0;
END;
GO
