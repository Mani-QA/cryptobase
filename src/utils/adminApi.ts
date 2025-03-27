
import { toast } from "sonner";
import coinsData from "@/data/coins.json";
import { saveJsonToFile, ServerResponse } from "./serverUtils";

// Types for coin metadata and portfolio
export interface CoinMetadata {
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
}

export interface Portfolio {
  mockPortfolio: Record<string, number>;
  coinMetadata: Record<string, CoinMetadata>;
}

// Functions to update the coins.json file
export const updateCoinQuantity = async (coinId: string, quantity: number): Promise<boolean> => {
  try {
    const coinData = { ...coinsData } as Portfolio;
    
    // Check if coin exists
    if (!coinData.mockPortfolio[coinId] && !coinData.coinMetadata[coinId]) {
      toast.error(`Coin ${coinId} does not exist in the portfolio`);
      return false;
    }
    
    // Update quantity
    coinData.mockPortfolio[coinId] = quantity;
    
    // Write to file
    await saveCoinsData(coinData);
    toast.success(`Updated ${coinId} quantity to ${quantity}`);
    return true;
  } catch (error) {
    console.error("Error updating coin quantity:", error);
    toast.error("Failed to update coin quantity");
    return false;
  }
};

export const addNewCoin = async (
  coinId: string,
  quantity: number,
  metadata: CoinMetadata
): Promise<boolean> => {
  try {
    const coinData = { ...coinsData } as Portfolio;
    
    // Check if coin already exists
    if (coinData.coinMetadata[coinId]) {
      toast.error(`Coin ${coinId} already exists in the portfolio`);
      return false;
    }
    
    // Add coin
    coinData.mockPortfolio[coinId] = quantity;
    coinData.coinMetadata[coinId] = metadata;
    
    // Write to file
    await saveCoinsData(coinData);
    toast.success(`Added ${metadata.name} to portfolio`);
    return true;
  } catch (error) {
    console.error("Error adding new coin:", error);
    toast.error("Failed to add new coin");
    return false;
  }
};

export const updateCoinMetadata = async (
  coinId: string,
  metadata: Partial<CoinMetadata>
): Promise<boolean> => {
  try {
    const coinData = { ...coinsData } as Portfolio;
    
    // Check if coin exists
    if (!coinData.coinMetadata[coinId]) {
      toast.error(`Coin ${coinId} does not exist in the portfolio`);
      return false;
    }
    
    // Update metadata
    coinData.coinMetadata[coinId] = {
      ...coinData.coinMetadata[coinId],
      ...metadata
    };
    
    // Write to file
    await saveCoinsData(coinData);
    toast.success(`Updated ${coinId} metadata`);
    return true;
  } catch (error) {
    console.error("Error updating coin metadata:", error);
    toast.error("Failed to update coin metadata");
    return false;
  }
};

export const deleteCoin = async (coinId: string): Promise<boolean> => {
  try {
    const coinData = { ...coinsData } as Portfolio;
    
    // Check if coin exists
    if (!coinData.mockPortfolio[coinId] && !coinData.coinMetadata[coinId]) {
      toast.error(`Coin ${coinId} does not exist in the portfolio`);
      return false;
    }
    
    // Delete coin
    delete coinData.mockPortfolio[coinId];
    delete coinData.coinMetadata[coinId];
    
    // Write to file
    await saveCoinsData(coinData);
    toast.success(`Deleted ${coinId} from portfolio`);
    return true;
  } catch (error) {
    console.error("Error deleting coin:", error);
    toast.error("Failed to delete coin");
    return false;
  }
};

// Helper function to save data to coins.json
const saveCoinsData = async (data: Portfolio): Promise<void> => {
  try {
    // In a real server environment, we would save to the file system
    // For this demo, we're just simulating it
    const response = await saveJsonToFile("/src/data/coins.json", data);
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    console.log("Changes would be saved to coins.json");
    toast.info("In a real server, changes would be saved to coins.json");
  } catch (error) {
    console.error("Error saving coins data:", error);
    toast.error("Failed to save changes to coins.json");
    throw error;
  }
};

// Get all coins data
export const getAllCoinsData = (): Portfolio => {
  return coinsData as Portfolio;
};
