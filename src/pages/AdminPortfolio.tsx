
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  getAllCoinsData, 
  updateCoinQuantity, 
  addNewCoin,
  updateCoinMetadata,
  deleteCoin,
  CoinMetadata
} from "@/utils/adminApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Edit, Plus, Save, Trash2 } from "lucide-react";

const AdminPortfolio = () => {
  const [coinsData, setCoinsData] = useState(getAllCoinsData());
  const [editingCoin, setEditingCoin] = useState<string | null>(null);
  const [newQuantities, setNewQuantities] = useState<Record<string, number>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addCoinForm = useForm({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      quantity: 0,
      image: "",
      current_price: 0,
      price_change_percentage_24h: 0,
      price_change_percentage_7d_in_currency: 0
    }
  });

  // Handle quantity change for a coin
  const handleQuantityChange = (coinId: string, value: string) => {
    setNewQuantities({
      ...newQuantities,
      [coinId]: parseFloat(value) || 0
    });
  };

  // Save updated quantity
  const saveQuantity = async (coinId: string) => {
    if (newQuantities[coinId] !== undefined) {
      const success = await updateCoinQuantity(coinId, newQuantities[coinId]);
      if (success) {
        // Update local state to reflect changes
        setCoinsData({
          ...coinsData,
          mockPortfolio: {
            ...coinsData.mockPortfolio,
            [coinId]: newQuantities[coinId]
          }
        });
        setEditingCoin(null);
      }
    }
  };

  // Handle delete coin
  const handleDeleteCoin = async (coinId: string) => {
    if (confirm(`Are you sure you want to delete ${coinId}?`)) {
      const success = await deleteCoin(coinId);
      if (success) {
        // Update local state to reflect changes
        const updatedMockPortfolio = { ...coinsData.mockPortfolio };
        const updatedCoinMetadata = { ...coinsData.coinMetadata };
        delete updatedMockPortfolio[coinId];
        delete updatedCoinMetadata[coinId];
        
        setCoinsData({
          mockPortfolio: updatedMockPortfolio,
          coinMetadata: updatedCoinMetadata
        });
      }
    }
  };

  // Handle add new coin
  const handleAddCoin = async (data: any) => {
    const coinId = data.id.toLowerCase();
    const metadata: CoinMetadata = {
      name: data.name,
      symbol: data.symbol.toLowerCase(),
      image: data.image,
      current_price: data.current_price,
      price_change_percentage_24h: data.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: data.price_change_percentage_7d_in_currency
    };

    const success = await addNewCoin(coinId, data.quantity, metadata);
    if (success) {
      // Update local state to reflect changes
      setCoinsData({
        mockPortfolio: {
          ...coinsData.mockPortfolio,
          [coinId]: data.quantity
        },
        coinMetadata: {
          ...coinsData.coinMetadata,
          [coinId]: metadata
        }
      });
      
      setIsAddDialogOpen(false);
      addCoinForm.reset();
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Portfolio Admin</h1>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage your cryptocurrency portfolio data
        </p>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add New Coin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Cryptocurrency</DialogTitle>
              <DialogDescription>
                Enter details for the new coin to add to your portfolio
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addCoinForm}>
              <form onSubmit={addCoinForm.handleSubmit(handleAddCoin)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addCoinForm.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coin ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="bitcoin" />
                        </FormControl>
                        <FormDescription>
                          Unique ID (e.g., bitcoin, ethereum)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addCoinForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="btc" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addCoinForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bitcoin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addCoinForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any" 
                            placeholder="0.01" 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addCoinForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addCoinForm.control}
                    name="current_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any" 
                            placeholder="30000" 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addCoinForm.control}
                    name="price_change_percentage_24h"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>24h Change (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any" 
                            placeholder="2.5" 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addCoinForm.control}
                    name="price_change_percentage_7d_in_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>7d Change (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any" 
                            placeholder="5.3" 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">Add Coin</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio Holdings</CardTitle>
          <CardDescription>
            Manage your cryptocurrency assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coin</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Value (USD)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(coinsData.mockPortfolio).map(([coinId, quantity]) => {
                const metadata = coinsData.coinMetadata[coinId];
                if (!metadata) return null;
                
                const value = quantity * metadata.current_price;
                const isEditing = editingCoin === coinId;
                
                return (
                  <TableRow key={coinId}>
                    <TableCell className="flex items-center gap-2">
                      <img 
                        src={metadata.image} 
                        alt={metadata.name} 
                        className="w-6 h-6 rounded-full" 
                      />
                      {metadata.name}
                    </TableCell>
                    <TableCell className="uppercase">{metadata.symbol}</TableCell>
                    <TableCell>${metadata.current_price.toLocaleString()}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="any"
                          value={newQuantities[coinId] !== undefined ? newQuantities[coinId] : quantity}
                          onChange={(e) => handleQuantityChange(coinId, e.target.value)}
                          className="w-32"
                        />
                      ) : (
                        quantity
                      )}
                    </TableCell>
                    <TableCell>${value.toLocaleString()}</TableCell>
                    <TableCell className="space-x-2">
                      {isEditing ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => saveQuantity(coinId)}
                        >
                          <Save size={16} />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingCoin(coinId)}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteCoin(coinId)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <p className="text-sm text-muted-foreground">
            Changes will be saved to coins.json
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminPortfolio;
