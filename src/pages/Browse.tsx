import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, Eye, Package, Grid, List, SlidersHorizontal, X, 
  Smartphone, Laptop, Backpack, Key, Headphones, Watch, Camera, Wallet, Coffee, BookOpen, 
  Glasses, Calculator, Umbrella, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useItems, useCategories, useLocations } from '@/hooks/useItems';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SplitText from '@/components/ui/SplitText';
import ResponsiveWrapper from '@/components/ResponsiveWrapper';
import MobileBrowse from '@/components/mobile/pages/MobileBrowse';

const DesktopBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [itemType, setItemType] = useState<'all' | 'lost' | 'found'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Initialize state from URL parameters
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && ['lost', 'found'].includes(typeFromUrl)) {
      setItemType(typeFromUrl as 'lost' | 'found');
    }
  }, [searchParams]);

  // Update URL when item type changes
  const handleItemTypeChange = (newType: 'all' | 'lost' | 'found') => {
    setItemType(newType);
    const newParams = new URLSearchParams(searchParams);
    if (newType === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', newType);
    }
    setSearchParams(newParams);
  };

  // Fetch data
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  
  const { data: items = [], isLoading, error } = useItems({
    itemType: itemType === 'all' ? undefined : itemType,
    limit: 100
  });

  // Predefined category filters with icons
  const categoryFilters = [
    { id: 'electronics', name: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'accessories', name: 'Accessories', icon: Watch, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'bags', name: 'Bags & Backpacks', icon: Backpack, color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'keys', name: 'Keys & Cards', icon: Key, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'audio', name: 'Audio Equipment', icon: Headphones, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'personal', name: 'Personal Items', icon: Wallet, color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { id: 'books', name: 'Books & Stationery', icon: BookOpen, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'clothing', name: 'Clothing & Eyewear', icon: Glasses, color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { id: 'sports', name: 'Sports & Recreation', icon: Coffee, color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'other', name: 'Other Items', icon: Package, color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      // Search query filter - Enhanced algorithm
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        
        // Split query into individual terms for better matching
        const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
        
        // Create searchable text from all item fields
        const searchableText = [
          item.title,
          item.description,
          item.category?.name || '',
          item.location?.name || '',
          item.specific_location || '',
          ...(item.tags || []),
          item.item_type
        ].join(' ').toLowerCase();

        // Check if all query terms are found in the searchable text
        const matchesSearch = queryTerms.every(term => {
          return searchableText.includes(term) ||
            // Also check for partial matches in title and description
            item.title.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            // Check category name with fuzzy matching
            (item.category?.name.toLowerCase().includes(term)) ||
            // Check location with fuzzy matching
            (item.location?.name.toLowerCase().includes(term)) ||
            // Check tags if they exist
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
        });

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const itemCategoryName = item.category?.name.toLowerCase() || 'other';
        const matchesCategory = selectedCategories.some(selectedCat => {
          switch (selectedCat) {
            case 'electronics':
              return ['electronics', 'smartphone', 'laptop', 'tablet', 'computer', 'phone', 'device', 'charger', 'cable', 'mouse', 'keyboard'].some(term => 
                itemCategoryName.includes(term));
            case 'accessories':
              return ['accessories', 'watch', 'jewelry', 'belt', 'tie', 'bracelet', 'necklace', 'ring'].some(term => 
                itemCategoryName.includes(term));
            case 'bags':
              return ['bag', 'backpack', 'purse', 'briefcase', 'luggage', 'suitcase', 'handbag', 'tote'].some(term => 
                itemCategoryName.includes(term));
            case 'keys':
              return ['keys', 'card', 'keychain', 'id', 'credit', 'access', 'student', 'driver'].some(term => 
                itemCategoryName.includes(term));
            case 'audio':
              return ['headphones', 'earbuds', 'speaker', 'audio', 'music', 'airpods', 'beats', 'wireless'].some(term => 
                itemCategoryName.includes(term));
            case 'personal':
              return ['wallet', 'personal', 'money', 'cash', 'document', 'passport', 'license'].some(term => 
                itemCategoryName.includes(term));
            case 'books':
              return ['book', 'notebook', 'pen', 'pencil', 'stationery', 'calculator', 'textbook', 'notes'].some(term => 
                itemCategoryName.includes(term));
            case 'clothing':
              return ['clothing', 'glasses', 'sunglasses', 'shirt', 'jacket', 'hat', 'shoes', 'coat', 'sweater'].some(term => 
                itemCategoryName.includes(term));
            case 'sports':
              return ['sports', 'recreation', 'ball', 'equipment', 'bottle', 'coffee', 'gym', 'fitness', 'water'].some(term => 
                itemCategoryName.includes(term));
            case 'other':
              return true;
            default:
              return false;
          }
        });
        if (!matchesCategory) return false;
      }

      // Location filter
      if (selectedLocation && item.location?.id !== selectedLocation) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedLocation('');
    setItemType('all');
    setSortBy('newest');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedLocation) count++;
    if (itemType !== 'all') count++;
    return count;
  };

  const ItemCard = ({ item, index }: { item: any, index: number }) => (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative z-10" style={{ backgroundColor: 'white', opacity: 1 }}>
      <CardContent className="p-6" style={{ backgroundColor: 'white', opacity: 1 }}>
        {/* Enhanced Image Display */}
        <div className="relative overflow-hidden rounded-2xl h-52 bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images[0]} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback icon when no image */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{display: item.images && item.images.length > 0 ? 'none' : 'flex'}}>
            {item.item_type === 'lost' ? (
              <Search className="text-amber-500 w-12 h-12" />
            ) : (
              <Eye className="text-green-500 w-12 h-12" />
            )}
          </div>
          
          <Badge 
            className={`absolute top-3 right-3 font-semibold backdrop-blur-sm ${
              item.item_type === 'lost' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            }`}
          >
            {item.item_type === 'lost' ? '🔍 Lost' : '👁️ Found'}
          </Badge>
        </div>
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold group-hover:text-amber-600 transition-colors text-gray-800 text-xl line-clamp-2 flex-1">
            {item.title}
          </h3>
          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 ml-2 flex-shrink-0">
            {item.category?.name || 'Other'}
          </Badge>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{item.location?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        <Button asChild className="w-full elegant-button bg-gray-900 hover:bg-gray-800 text-white">
          <Link to={`/items/${item.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative text-white py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                top: `${20 + (i * 10)}%`,
                left: `${15 + (i * 10)}%`,
                animation: `gentleFloat ${10 + (i * 2)}s ease-in-out infinite ${i * 1}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SplitText
            text="Browse Lost & Found Items"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            delay={120}
            duration={0.7}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 50, rotationY: 20 }}
            to={{ opacity: 1, y: 0, rotationY: 0 }}
            threshold={0.2}
            rootMargin="-80px"
            textAlign="center"
          />
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Search through our comprehensive database of lost and found items
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Section */}
        <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by title, description, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg elegant-input"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Tabs value={itemType} onValueChange={(value) => handleItemTypeChange(value as 'all' | 'lost' | 'found')} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white">All Items</TabsTrigger>
                  <TabsTrigger value="lost" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">Lost</TabsTrigger>
                  <TabsTrigger value="found" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Found</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-auto"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-6 space-y-6">
                {/* Category Filters */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {categoryFilters.map((category) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? `${category.color} border-current shadow-md` 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <Icon className={`w-5 h-5 mr-2 ${isSelected ? '' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-700'}`}>
                            {category.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location
                  </h3>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {getActiveFiltersCount() > 0 && (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            Showing {filteredItems.length} of {items.length} items
            {searchQuery && ` for "${searchQuery}"`}
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(categoryId => {
                const category = categoryFilters.find(c => c.id === categoryId);
                if (!category) return null;
                return (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                    {category.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => toggleCategory(categoryId)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white border border-gray-200 shadow-lg rounded-2xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredItems.length === 0 && (
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategories.length > 0 || selectedLocation
                  ? "Try adjusting your search criteria or filters to find more items."
                  : "No items have been reported yet. Be the first to report a lost or found item!"
                }
              </p>
              {(searchQuery || selectedCategories.length > 0 || selectedLocation) && (
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border border-red-200 shadow-lg rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">Unable to load items. Please try again.</div>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

const Browse = () => {
  return (
    <ResponsiveWrapper
      desktopComponent={<DesktopBrowse />}
      mobileComponent={<MobileBrowse />}
    />
  );
};

export default Browse; 