using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.DAOs.Factories;

/// <summary>
/// Factory specifically mapped as a Singleton to provision Singleton DAOs.
/// </summary>
public interface IDaoFactory
{
    ICategoryDao GetCategoryDao();
    ITransactionDao GetTransactionDao();
}
