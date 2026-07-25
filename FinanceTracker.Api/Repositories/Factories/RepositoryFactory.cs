using FinanceTracker.Api.DAOs.Factories;
using FinanceTracker.Api.Repositories.Interfaces;

namespace FinanceTracker.Api.Repositories.Factories;

/// <summary>
/// Singleton factory holding the single instances of the Repositories.
/// Draws DAOs from the DaoFactory.
/// </summary>
public class RepositoryFactory : IRepositoryFactory
{
    private readonly Lazy<ICategoryRepository> _categoryRepository;
    private readonly Lazy<ITransactionRepository> _transactionRepository;
    private readonly Lazy<IFixedCostRepository> _fixedCostRepository;

    public RepositoryFactory(IDaoFactory daoFactory)
    {
        // Init exactly once pushing the DAO singletons into the Repo singletons
        _categoryRepository = new Lazy<ICategoryRepository>(() => new CategoryRepository(daoFactory.GetCategoryDao()));
        _transactionRepository = new Lazy<ITransactionRepository>(() => new TransactionRepository(daoFactory.GetTransactionDao()));
        _fixedCostRepository = new Lazy<IFixedCostRepository>(() => new FixedCostRepository(daoFactory.GetFixedCostDao()));
    }

    public ICategoryRepository GetCategoryRepository() => _categoryRepository.Value;
    public ITransactionRepository GetTransactionRepository() => _transactionRepository.Value;
    public IFixedCostRepository GetFixedCostRepository() => _fixedCostRepository.Value;
}
