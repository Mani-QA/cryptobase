
import { toast } from "sonner";
import coinsData from "@/data/coins.json";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: {
    price: number[];
  };
  quantity?: number; // User's holdings
  total_value?: number; // current_price * quantity
}

export interface PortfolioSummary {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  coins: Coin[];
}

// Get mock portfolio data from JSON file
const mockPortfolio: { [key: string]: number } = coinsData.mockPortfolio;

// Function to fetch coin data from CoinGecko API
export const fetchCoinData = async (): Promise<PortfolioSummary> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${Object.keys(
        mockPortfolio
      ).join(",")}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`
    );

    if (!response.ok) {
      // If rate limited, use mock data
      return generateMockData();
    }

    const data: Coin[] = await response.json();
    
    // Calculate portfolio values
    let totalValue = 0;
    let dailyChange = 0;

    const enrichedCoins = data.map((coin) => {
      const quantity = mockPortfolio[coin.id] || 0;
      const total_value = coin.current_price * quantity;
      
      totalValue += total_value;
      dailyChange += (total_value * coin.price_change_percentage_24h) / 100;
      
      return {
        ...coin,
        quantity,
        total_value,
      };
    });

    const dailyChangePercentage = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

    return {
      totalValue,
      dailyChange,
      dailyChangePercentage,
      coins: enrichedCoins,
    };
  } catch (error) {
    console.error("Error fetching coin data:", error);
    toast.error("Failed to fetch cryptocurrency data");
    
    // Return mock data on failure
    return generateMockData();
  }
};

// Generate mock data for testing or when API fails
const generateMockData = (): PortfolioSummary => {
  // Get mock coins from JSON file and generate sparkline data
  const mockCoins: Coin[] = coinsData.mockCoins.map(coin => {
    let basePrice = coin.current_price;
    let variation = basePrice * 0.1; // 10% variation
    
    return {
      ...coin,
      sparkline_in_7d: {
        price: generateSparklineData(basePrice, variation, 7)
      }
    };
  });

  // Calculate total value and changes
  let totalValue = 0;
  let dailyChange = 0;

  mockCoins.forEach((coin) => {
    if (coin.total_value) {
      totalValue += coin.total_value;
      dailyChange += (coin.total_value * coin.price_change_percentage_24h) / 100;
    }
  });

  const dailyChangePercentage = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

  return {
    totalValue,
    dailyChange,
    dailyChangePercentage,
    coins: mockCoins,
  };
};

// Helper to generate random sparkline data
function generateSparklineData(
  basePrice: number, 
  variation: number, 
  days: number
): number[] {
  const data: number[] = [];
  for (let i = 0; i < days * 24; i++) {
    const randomChange = (Math.random() - 0.5) * variation * 0.1;
    const lastPrice = data.length > 0 ? data[data.length - 1] : basePrice;
    data.push(lastPrice + randomChange);
  }
  return data;
}
