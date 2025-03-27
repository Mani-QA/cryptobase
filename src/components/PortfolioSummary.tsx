
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import DistributionChart from "./DistributionChart";
import { Coin } from "@/utils/api";

interface PortfolioSummaryProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  coins: Coin[];
  onExport: () => void;
  className?: string;
  currencyType: 'USD' | 'CAD' | 'INR';
}

const PortfolioSummary = ({
  totalValue,
  dailyChange,
  dailyChangePercentage,
  coins,
  onExport,
  className = "",
  currencyType,
}: PortfolioSummaryProps) => {
  const isPositive = dailyChangePercentage >= 0;
  const changeColor = isPositive ? "text-positive" : "text-negative";

  // For distribution chart, we use the original USD values to calculate percentages
  // since percentage distributions should be the same regardless of currency
  const getOriginalTotalValue = () => {
    return coins.reduce((total, coin) => total + (coin.total_value || 0), 0);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Portfolio Value</h2>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {formatCurrency(totalValue, currencyType)}
              </h1>
              <div className={`flex items-center gap-1 font-medium ${changeColor}`}>
                {isPositive ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>{formatPercentage(dailyChangePercentage)}</span>
                <span className="text-sm">24h</span>
              </div>
            </div>
            <p className={`text-sm mt-1 ${changeColor}`}>
              {formatCurrency(dailyChange, currencyType)} today
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-sm gap-2"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          <div className="lg:col-span-2 flex justify-center">
            <DistributionChart 
              coins={coins}
              size={180}
              className="animate-fade-in mt-2"
              currencyType={currencyType}
            />
          </div>
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Portfolio Distribution
            </h3>
            <div className="space-y-3">
              {coins
                .filter(coin => (coin.total_value || 0) > 0)
                .sort((a, b) => (b.total_value || 0) - (a.total_value || 0))
                .slice(0, 5)
                .map(coin => {
                  // Calculate percentage based on original USD values
                  const originalTotal = getOriginalTotalValue();
                  const percentage = originalTotal > 0 
                    ? ((coin.total_value || 0) / originalTotal) * 100 
                    : 0;
                    
                  return (
                    <div key={coin.id} className="flex items-center gap-2">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium">{coin.name}</span>
                        <span className="text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              {coins.length > 5 && (
                <div className="text-sm text-muted-foreground text-right mt-2">
                  +{coins.length - 5} more
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
