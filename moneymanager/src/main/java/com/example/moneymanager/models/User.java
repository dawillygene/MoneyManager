package com.example.moneymanager.models;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String confirmPassword;

    @Column(nullable = false)
    private boolean agreeToTerms;

    @Column(nullable = true)
    private String refreshToken;

    // Extended profile fields
    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String street;

    @Column(nullable = true)
    private String city;

    @Column(nullable = true)
    private String state;

    @Column(nullable = true)
    private String zipCode;

    @Column(nullable = true)
    private String country;

    @Column(nullable = true)
    private String avatar;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = true)
    private String emailVerificationToken;

    @Column(nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(nullable = true)
    private String twoFactorSecret;

    @Column(nullable = true)
    private String backupCodes;

    // User preferences
    @Column(nullable = false)
    private String currency = "USD";

    @Column(nullable = false)
    private String timezone = "America/New_York";

    @Column(nullable = false)
    private String theme = "light";

    @Column(nullable = false)
    private String language = "en";

    @Column(nullable = false)
    private String dateFormat = "MM/DD/YYYY";

    // Notification preferences
    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Column(nullable = false)
    private boolean pushNotifications = false;

    @Column(nullable = false)
    private boolean budgetAlerts = true;

    @Column(nullable = false)
    private boolean goalReminders = true;

    // Privacy settings
    @Column(nullable = false)
    private boolean shareData = false;

    @Column(nullable = false)
    private boolean publicProfile = false;

    @Column(nullable = false)
    private boolean analyticsEnabled = true;

    @Column(nullable = false)
    private boolean marketingEnabled = false;

    @Column(nullable = false)
    private boolean thirdPartyEnabled = false;

    @Column(nullable = false)
    private boolean shareTransactions = false;

    @Column(nullable = false)
    private boolean shareGoals = false;

    @Column(nullable = false)
    private boolean newslettersEnabled = true;

    @Column(nullable = false)
    private boolean productUpdatesEnabled = false;

    @Column(nullable = false)
    private boolean surveyInvitationsEnabled = false;

    // Audit fields
    @Column(nullable = true, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public boolean isAgreeToTerms() {
        return agreeToTerms;
    }

    public void setAgreeToTerms(boolean agreeToTerms) {
        this.agreeToTerms = agreeToTerms;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    // Extended profile getters and setters
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }

    public String getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(String backupCodes) {
        this.backupCodes = backupCodes;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }

    public boolean isBudgetAlerts() {
        return budgetAlerts;
    }

    public void setBudgetAlerts(boolean budgetAlerts) {
        this.budgetAlerts = budgetAlerts;
    }

    public boolean isGoalReminders() {
        return goalReminders;
    }

    public void setGoalReminders(boolean goalReminders) {
        this.goalReminders = goalReminders;
    }

    public boolean isShareData() {
        return shareData;
    }

    public void setShareData(boolean shareData) {
        this.shareData = shareData;
    }

    public boolean isPublicProfile() {
        return publicProfile;
    }

    public void setPublicProfile(boolean publicProfile) {
        this.publicProfile = publicProfile;
    }

    public boolean isAnalyticsEnabled() {
        return analyticsEnabled;
    }

    public void setAnalyticsEnabled(boolean analyticsEnabled) {
        this.analyticsEnabled = analyticsEnabled;
    }

    public boolean isMarketingEnabled() {
        return marketingEnabled;
    }

    public void setMarketingEnabled(boolean marketingEnabled) {
        this.marketingEnabled = marketingEnabled;
    }

    public boolean isThirdPartyEnabled() {
        return thirdPartyEnabled;
    }

    public void setThirdPartyEnabled(boolean thirdPartyEnabled) {
        this.thirdPartyEnabled = thirdPartyEnabled;
    }

    public boolean isShareTransactions() {
        return shareTransactions;
    }

    public void setShareTransactions(boolean shareTransactions) {
        this.shareTransactions = shareTransactions;
    }

    public boolean isShareGoals() {
        return shareGoals;
    }

    public void setShareGoals(boolean shareGoals) {
        this.shareGoals = shareGoals;
    }

    public boolean isNewslettersEnabled() {
        return newslettersEnabled;
    }

    public void setNewslettersEnabled(boolean newslettersEnabled) {
        this.newslettersEnabled = newslettersEnabled;
    }

    public boolean isProductUpdatesEnabled() {
        return productUpdatesEnabled;
    }

    public void setProductUpdatesEnabled(boolean productUpdatesEnabled) {
        this.productUpdatesEnabled = productUpdatesEnabled;
    }

    public boolean isSurveyInvitationsEnabled() {
        return surveyInvitationsEnabled;
    }

    public void setSurveyInvitationsEnabled(boolean surveyInvitationsEnabled) {
        this.surveyInvitationsEnabled = surveyInvitationsEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}