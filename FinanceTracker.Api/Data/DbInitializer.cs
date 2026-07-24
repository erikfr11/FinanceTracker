using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            var dbContext = services.GetRequiredService<AppDbContext>();
            await dbContext.Database.MigrateAsync();

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var userManager = services.GetRequiredService<UserManager<User>>();
            var configuration = services.GetRequiredService<IConfiguration>();

            // 1. Ensure Admin role exists
            const string adminRole = "Admin";
            if (!await roleManager.RoleExistsAsync(adminRole))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(adminRole));
            }

            // 2. Read Admin user configuration
            var adminSection = configuration.GetSection("AdminUser");
            var adminEmail = adminSection["Email"] ?? "admin@financetracker.local";
            var adminPassword = adminSection["Password"] ?? "AdminPassword123!";
            var firstName = adminSection["FirstName"] ?? "Admin";
            var lastName = adminSection["LastName"] ?? "User";

            // 3. Create or update Admin user to match appsettings
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                // Check if any admin user exists to update
                var existingAdmins = await userManager.GetUsersInRoleAsync(adminRole);
                if (existingAdmins.Any())
                {
                    adminUser = existingAdmins.First();
                    await userManager.SetEmailAsync(adminUser, adminEmail);
                    await userManager.SetUserNameAsync(adminUser, adminEmail);
                    adminUser.EmailConfirmed = true;
                    adminUser.FirstName = firstName;
                    adminUser.LastName = lastName;
                    await userManager.UpdateAsync(adminUser);

                    var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                    await userManager.ResetPasswordAsync(adminUser, token, adminPassword);
                    logger.LogInformation("Updated existing Admin user to '{Email}'.", adminEmail);
                }
                else
                {
                    adminUser = new User
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true,
                        FirstName = firstName,
                        LastName = lastName,
                        IsPremiumUser = true
                    };

                    var result = await userManager.CreateAsync(adminUser, adminPassword);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, adminRole);
                        logger.LogInformation("Default Admin user '{Email}' successfully created.", adminEmail);
                    }
                    else
                    {
                        logger.LogError("Failed to create default Admin user: {Errors}", 
                            string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
            }
            else
            {
                if (!await userManager.IsInRoleAsync(adminUser, adminRole))
                {
                    await userManager.AddToRoleAsync(adminUser, adminRole);
                    logger.LogInformation("Added Admin role to existing admin user '{Email}'.", adminEmail);
                }

                // Ensure password is synchronized with appsettings
                var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                await userManager.ResetPasswordAsync(adminUser, token, adminPassword);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
