import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateItem } from '@/hooks/useItems';
import { Camera, MapPin, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SplitText from '@/components/ui/SplitText';

const foundItemSchema = z.object({
  title: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().optional(),
  location: z.string().min(1, 'Please enter the location where you found the item'),
  specific_location: z.string().optional(),
  date_lost_found: z.string().min(1, 'Please select the date when you found the item'),
  time_lost_found: z.string().optional(),
  contact_phone: z.string().optional(),
});

type FoundItemForm = z.infer<typeof foundItemSchema>;

const Found = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const createItemMutation = useCreateItem();

  const form = useForm<FoundItemForm>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      specific_location: '',
      date_lost_found: '',
      time_lost_found: '',
      contact_phone: '',
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FoundItemForm) => {
    try {
      const itemData = {
        title: data.title,
        description: data.description,
        item_type: 'found' as const,
        category: data.category && data.category.trim() !== '' ? data.category : null,
        location: data.location,
        specific_location: data.specific_location && data.specific_location.trim() !== '' ? data.specific_location : null,
        date_lost_found: new Date(data.date_lost_found).toISOString().split('T')[0],
        time_lost_found: data.time_lost_found && data.time_lost_found.trim() !== '' ? data.time_lost_found : null,
        contact_phone: data.contact_phone && data.contact_phone.trim() !== '' ? data.contact_phone : null,
        contact_email: user?.email || '',
      };

      await createItemMutation.mutateAsync({
        item: itemData,
        images: selectedImages,
      });

      toast({
        title: "Found Item Report Submitted!",
        description: "Your found item has been submitted for review. We'll help reunite it with its owner.",
      });

      form.reset();
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.error('error while uplaoding found item');
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen cream-gradient">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-block p-4 bg-white/20 rounded-3xl mb-6 backdrop-blur-sm">
              <Tag className="h-12 w-12 text-primary" />
            </div>
            <SplitText
              text="Report Found Item"
              className="text-5xl font-bold text-white mb-4 text-shimmer"
              delay={120}
              duration={0.8}
              ease="power2.out"
              splitType="words"
              from={{ opacity: 0, y: 50, scale: 0.8 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              threshold={0.3}
              rootMargin="-100px"
              textAlign="center"
            />
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Help us reunite lost items with their owners. Report what you've found and make someone's day!
            </p>
          </div>

          {/* Form Card */}
          <Card className="elegant-card bg-white/95 backdrop-blur-md border-0 shadow-2xl slide-up">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-primary">Found Item Details</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Please provide details about the item you found to help identify the owner
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Item Name */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-primary">Item Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., iPhone 13 Pro, blue backpack, car keys"
                            className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-primary">Description</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Describe the item in detail - color, brand, condition, any distinctive features..."
                            className="w-full h-32 px-4 py-3 text-lg rounded-2xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-primary">Category (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Electronics, Clothing, Books"
                              className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-primary flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Where You Found It
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Main Library, Campus Cafeteria, Building A"
                              className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date Found */}
                  <FormField
                    control={form.control}
                    name="date_lost_found"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-primary flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          When did you find it?
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Specific Location and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="specific_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-primary">Specific Location Details (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., under a bench, near the vending machine, etc."
                              className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time_lost_found"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-primary">Time Found (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Information */}
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-primary">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="h-12 text-lg rounded-2xl border-gray-300 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <label className="text-lg font-semibold text-primary flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Upload Photos (Recommended - Max 5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {imagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {imagePreviews.length < 5 && (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-primary transition-colors">
                                <div className="text-gray-500">
                                  <Camera className="h-8 w-8 mx-auto mb-2" />
                                  <p className="text-sm">Add More</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <Camera className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">Click to upload photos</p>
                            <p className="text-sm">Photos help owners identify their items</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-8">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createItemMutation.isPending}
                      className="elegant-button button-found px-12 py-4 text-xl font-semibold"
                    >
                      {createItemMutation.isPending ? 'Submitting...' : 'Submit Found Item Report'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Found;
