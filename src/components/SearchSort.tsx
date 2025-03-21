
import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Coin } from "@/utils/api";

interface SearchSortProps {
  onSearch: (term: string) => void;
  onSort: (key: SortOption) => void;
  className?: string;
}

export type SortOption = 
  | "value-high" 
  | "value-low" 
  | "name-a" 
  | "name-z" 
  | "price-high" 
  | "price-low" 
  | "change-high" 
  | "change-low";

const SearchSort = ({ onSearch, onSort, className = "" }: SearchSortProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSort = (value: string) => {
    onSort(value as SortOption);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search coins..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 h-10"
        />
      </div>

      <div className="w-full sm:w-52">
        <Select defaultValue="value-high" onValueChange={handleSort}>
          <SelectTrigger className="h-10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value-high">Value: High to Low</SelectItem>
            <SelectItem value="value-low">Value: Low to High</SelectItem>
            <SelectItem value="name-a">Name: A to Z</SelectItem>
            <SelectItem value="name-z">Name: Z to A</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="change-high">Change: High to Low</SelectItem>
            <SelectItem value="change-low">Change: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchSort;
