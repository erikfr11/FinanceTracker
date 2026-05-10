using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.DAOs.Interfaces;

namespace FinanceTracker.Api.DAOs.Factories;

/// <summary>
/// Singleton factory holding the single instances of the DAOs.
/// Uses Lazy initialization to guarantee exactly one instantiation.
/// </summary>
public class DaoFactory : IDaoFactory
{
    private readonly Lazy<ICategoryDao> _categoryDao;
    private readonly Lazy<ITransactionDao> _transactionDao;

    public DaoFactory(IDbContextFactory<AppDbContext> contextFactory)
    {
        // Init exactly once using the ContextFactory
        _categoryDao = new Lazy<ICategoryDao>(() => new CategoryDao(contextFactory));
        _transactionDao = new Lazy<ITransactionDao>(() => new TransactionDao(contextFactory));
    }

    public ICategoryDao GetCategoryDao() => _categoryDao.Value;
    public ITransactionDao GetTransactionDao() => _transactionDao.Value;
}
