
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coin } from "@/utils/api";
import { formatCurrency, formatPercentage, formatCoinQuantity } from "@/utils/formatters";
import SparklineChart from "./SparklineChart";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";

interface CoinCardProps {
  coin: Coin;
  className?: string;
}

const CoinCard = ({ coin, className = "" }: CoinCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
  const changeColor = isPositive ? "text-positive" : "text-negative";
  
  // Animation classes based on expanded state
  const detailsClass = expanded
    ? "max-h-96 opacity-100 transition-all duration-500 ease-in-out"
    : "max-h-0 opacity-0 transition-all duration-300 ease-in-out overflow-hidden";

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      <CardContent 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={coin.image} 
              alt={coin.name} 
              className="w-10 h-10 rounded-full bg-white p-1"
              loading="lazy"
            />
            <div>
              <h3 className="font-medium text-lg">{coin.name}</h3>
              <p className="text-muted-foreground text-sm">{coin.symbol.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(coin.current_price)}</p>
            <p className={`text-sm font-medium flex items-center justify-end gap-1 ${changeColor}`}>
              {isPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {formatPercentage(coin.price_change_percentage_24h || 0)}
            </p>
          </div>
        </div>
        
        <div className="h-12 mb-4">
          <SparklineChart 
            data={coin.sparkline_in_7d?.price || []} 
            color={isPositive ? "hsl(var(--positive))" : "hsl(var(--negative))"}
            isPositive={isPositive}
            height={48}
            lineWidth={2}
            fillOpacity={0.1}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-xs">Quantity</p>
            <p className="font-medium">
              {formatCoinQuantity(coin.quantity || 0, coin.symbol)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Value</p>
            <p className="font-medium">{formatCurrency(coin.total_value || 0)}</p>
          </div>
        </div>

        {/* Expandable section */}
        <div className={detailsClass}>
          <div className="pt-4 mt-4 border-t">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted-foreground text-xs">7d Change</p>
                <p className={coin.price_change_percentage_7d_in_currency >= 0 ? "text-positive" : "text-negative"}>
                  {formatPercentage(coin.price_change_percentage_7d_in_currency || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Portfolio %</p>
                <p className="font-medium">
                  {/* Just a placeholder percentage for now */}
                  {((coin.total_value || 0) / 27195.4 * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            <a 
              href={`https://www.coingecko.com/en/coins/${coin.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              View on CoinGecko
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinCard;
