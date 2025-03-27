
import { useEffect, useState } from "react";
import { Coin, fetchCoinData } from "@/utils/api";
import type { PortfolioSummary as PortfolioSummaryType } from "@/utils/api";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import PortfolioSummary from "@/components/PortfolioSummary";
import CoinCard from "@/components/CoinCard";
import SearchSort, { SortOption } from "@/components/SearchSort";
import { formatDate, convertToCAD, convertToINR } from "@/utils/formatters";
import { RefreshCw, Loader2, DollarSign, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

const REFRESH_INTERVAL = 300000; // 5 minutes

const Index = () => {
  // Update document title and metadata
  useEffect(() => {
    document.title = "Crypto Portfolio Tracker";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Track your cryptocurrency portfolio with real-time updates and multi-currency support");
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioSummaryType | null>(null);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("value-high");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currencyType, setCurrencyType] = useState<'USD' | 'CAD' | 'INR'>('USD');

  // Fetch portfolio data
  const fetchPortfolioData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }
      
      const data = await fetchCoinData();
      setPortfolioData(data);
      applyFiltersAndSort(data.coins, searchTerm, sortOption);
      setLastUpdated(new Date());
      
      if (showRefreshing) {
        toast.success("Portfolio data refreshed");
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      toast.error("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData();

    // Set up auto-refresh
    const intervalId = setInterval(() => {
      fetchPortfolioData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // Apply filters and sorting to coins
  const applyFiltersAndSort = (
    coins: Coin[], 
    search: string,
    sort: SortOption
  ) => {
    // First filter by search term
    let filtered = coins;
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = coins.filter(
        coin => 
          coin.name.toLowerCase().includes(searchLower) || 
          coin.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Then sort
    let sorted = [...filtered];
    switch (sort) {
      case "value-high":
        sorted.sort((a, b) => (b.total_value || 0) - (a.total_value || 0));
        break;
      case "value-low":
        sorted.sort((a, b) => (a.total_value || 0) - (b.total_value || 0));
        break;
      case "name-a":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-high":
        sorted.sort((a, b) => b.current_price - a.current_price);
        break;
      case "price-low":
        sorted.sort((a, b) => a.current_price - b.current_price);
        break;
      case "change-high":
        sorted.sort((a, b) => 
          (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        );
        break;
      case "change-low":
        sorted.sort((a, b) => 
          (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
        );
        break;
    }

    setFilteredCoins(sorted);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (portfolioData) {
      applyFiltersAndSort(portfolioData.coins, term, sortOption);
    }
  };

  // Handle sort
  const handleSort = (option: SortOption) => {
    setSortOption(option);
    if (portfolioData) {
      applyFiltersAndSort(portfolioData.coins, searchTerm, option);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchPortfolioData(true);
  };

  // Handle export
  const handleExport = () => {
    if (!portfolioData) return;

    try {
      // Create CSV content
      const csvContent = [
        "Coin,Symbol,Price,24h Change,Quantity,Value",
        ...portfolioData.coins.map(coin => 
          `${coin.name},${coin.symbol.toUpperCase()},${coin.current_price},${coin.price_change_percentage_24h || 0},${coin.quantity || 0},${coin.total_value || 0}`
        )
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `crypto-portfolio-${formatDate(new Date()).replace(/,/g, "")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Portfolio data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export portfolio data");
    }
  };

  // Handle currency change
  const handleCurrencyChange = (currency: 'USD' | 'CAD' | 'INR') => {
    setCurrencyType(currency);
    toast.success(`Currency changed to ${currency}`);
  };

  // Calculate values based on selected currency
  const getTotalValue = () => {
    if (!portfolioData) return 0;
    if (currencyType === 'CAD') 
      return convertToCAD(portfolioData.totalValue);
    else if (currencyType === 'INR')
      return convertToINR(portfolioData.totalValue);
    else
      return portfolioData.totalValue;
  };

  const getDailyChange = () => {
    if (!portfolioData) return 0;
    if (currencyType === 'CAD') 
      return convertToCAD(portfolioData.dailyChange);
    else if (currencyType === 'INR')
      return convertToINR(portfolioData.dailyChange);
    else
      return portfolioData.dailyChange;
  };

  // Get currency icon
  const getCurrencyIcon = () => {
    switch (currencyType) {
      case 'INR':
        return <IndianRupee className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading your portfolio...</h2>
        <p className="text-muted-foreground mt-2">Fetching the latest cryptocurrency data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300">
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">Crypto Portfolio</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {getCurrencyIcon()}
                  {currencyType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCurrencyChange('USD')}>
                  USD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCurrencyChange('CAD')}>
                  CAD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCurrencyChange('INR')}>
                  INR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Refresh data"
            >
              {refreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6 animate-fade-in">
        {portfolioData && (
          <PortfolioSummary
            totalValue={getTotalValue()}
            dailyChange={getDailyChange()}
            dailyChangePercentage={portfolioData.dailyChangePercentage}
            coins={portfolioData.coins}
            onExport={handleExport}
            className="animate-fade-up opacity-0"
            currencyType={currencyType}
          />
        )}

        <div className="animate-fade-up opacity-0 delay-100">
          <SearchSort 
            onSearch={handleSearch} 
            onSort={handleSort}
            className="mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCoins.map((coin, index) => (
              <CoinCard 
                key={coin.id}
                coin={coin}
                className={`animate-fade-up opacity-0`}
                // Pass the original USD totalValue for consistent percentage calculations
                totalPortfolioValue={portfolioData?.totalValue || 0}
                currencyType={currencyType}
              />
            ))}
          </div>

          {filteredCoins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No coins found matching your search.</p>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          Last updated: {formatDate(lastUpdated)} at {lastUpdated.toLocaleTimeString()}
        </div>
      </main>
    </div>
  );
};

export default Index;
