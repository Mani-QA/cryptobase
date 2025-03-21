
import { toast } from "sonner";

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

// Mock portfolio data for demonstration
const mockPortfolio: { [key: string]: number } = {
  bitcoin: 0.5,
  ethereum: 2.3,
  cardano: 500,
  solana: 10,
  polkadot: 30,
  avalanche: 15,
  chainlink: 40,
  polygon: 100,
};

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
  const mockCoins: Coin[] = [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 39840.21,
      price_change_percentage_24h: 2.1,
      price_change_percentage_7d_in_currency: 5.3,
      sparkline_in_7d: {
        price: generateSparklineData(39000, 3000, 7),
      },
      quantity: 0.5,
      total_value: 19920.11,
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 2104.32,
      price_change_percentage_24h: 3.2,
      price_change_percentage_7d_in_currency: 7.5,
      sparkline_in_7d: {
        price: generateSparklineData(2000, 200, 7),
      },
      quantity: 2.3,
      total_value: 4839.94,
    },
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      current_price: 0.43,
      price_change_percentage_24h: -1.2,
      price_change_percentage_7d_in_currency: -3.1,
      sparkline_in_7d: {
        price: generateSparklineData(0.45, 0.05, 7),
      },
      quantity: 500,
      total_value: 215,
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 104.23,
      price_change_percentage_24h: 5.7,
      price_change_percentage_7d_in_currency: 12.3,
      sparkline_in_7d: {
        price: generateSparklineData(95, 15, 7),
      },
      quantity: 10,
      total_value: 1042.3,
    },
    {
      id: "polkadot",
      symbol: "dot",
      name: "Polkadot",
      image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      current_price: 6.89,
      price_change_percentage_24h: -0.8,
      price_change_percentage_7d_in_currency: 2.2,
      sparkline_in_7d: {
        price: generateSparklineData(6.7, 0.6, 7),
      },
      quantity: 30,
      total_value: 206.7,
    },
    {
      id: "avalanche",
      symbol: "avax",
      name: "Avalanche",
      image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
      current_price: 22.17,
      price_change_percentage_24h: 4.1,
      price_change_percentage_7d_in_currency: 9.2,
      sparkline_in_7d: {
        price: generateSparklineData(20, 3, 7),
      },
      quantity: 15,
      total_value: 332.55,
    },
    {
      id: "chainlink",
      symbol: "link",
      name: "Chainlink",
      image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      current_price: 13.92,
      price_change_percentage_24h: 1.3,
      price_change_percentage_7d_in_currency: 4.2,
      sparkline_in_7d: {
        price: generateSparklineData(13, 1.5, 7),
      },
      quantity: 40,
      total_value: 556.8,
    },
    {
      id: "polygon",
      symbol: "matic",
      name: "Polygon",
      image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
      current_price: 0.82,
      price_change_percentage_24h: -2.3,
      price_change_percentage_7d_in_currency: -1.1,
      sparkline_in_7d: {
        price: generateSparklineData(0.85, 0.08, 7),
      },
      quantity: 100,
      total_value: 82,
    },
  ];

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
