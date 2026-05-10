using FinanceTracker.Api.Repositories.Interfaces;

namespace FinanceTracker.Api.Repositories.Factories;

/// <summary>
/// Factory specifically mapped as a Singleton to provision Singleton Repositories.
/// </summary>
public interface IRepositoryFactory
{
    ICategoryRepository GetCategoryRepository();
    ITransactionRepository GetTransactionRepository();
}
