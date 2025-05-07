import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { audioDB } from "@/lib/indexedDb";
import { DialogClose } from "@radix-ui/react-dialog";
import { generateWaveformData } from "@/lib/utils";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  genre: z.string().min(1, "Please select a genre"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const genres = [
  "Electronic", "Hip Hop", "Rock", "Jazz", "Classical", "Reggae", 
  "Pop", "R&B", "Country", "Folk", "Blues", "Metal", "Ambient"
];

export default function UploadDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
    },
  });
  
  const handleAudioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is audio
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setAudioFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);
    
    // Get audio duration
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration * 1000); // Convert to ms
    });
  }, [toast]);
  
  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image file must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setCoverImage(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setCoverPreviewUrl(url);
  }, [toast]);
  
  const onSubmit = async (data: UploadFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload tracks",
        variant: "destructive",
      });
      return;
    }
    
    if (!audioFile) {
      toast({
        title: "Audio file required",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert files to base64 for storage
      const audioBase64 = await fileToBase64(audioFile);
      const coverBase64 = coverImage ? await fileToBase64(coverImage) : null;
      
      // Generate waveform data
      const waveformData = await generateWaveformData(audioFile);
      
      // Create track in database
      await audioDB.addTrack({
        userId: user.id,
        title: data.title,
        description: data.description || "",
        audioUrl: audioBase64,
        coverArt: coverBase64,
        duration: audioDuration,
        waveformData: JSON.stringify(waveformData),
        genre: data.genre,
      });
      
      toast({
        title: "Upload successful!",
        description: "Your track has been uploaded",
      });
      
      // Close dialog
      const closeButton = document.querySelector('[data-dialog-close]') as HTMLElement;
      if (closeButton) closeButton.click();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DialogContent className="bg-sidebar sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold font-poppins">Upload Track</DialogTitle>
        <DialogDescription>
          Share your music with the world
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <FormLabel>Audio File</FormLabel>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('audio-upload')?.click()}
                    disabled={isLoading}
                  >
                    Select Audio
                  </Button>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioChange}
                    disabled={isLoading}
                  />
                  {audioFile && (
                    <span className="text-sm text-muted-foreground truncate">
                      {audioFile.name}
                    </span>
                  )}
                </div>
                {audioPreviewUrl && (
                  <audio
                    ref={audioRef}
                    src={audioPreviewUrl}
                    controls
                    className="w-full mt-2"
                  />
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <FormLabel>Cover Art</FormLabel>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-upload')?.click()}
                    disabled={isLoading}
                  >
                    Select Image
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                    disabled={isLoading}
                  />
                  {coverImage && (
                    <span className="text-sm text-muted-foreground truncate">
                      {coverImage.name}
                    </span>
                  )}
                </div>
                {coverPreviewUrl && (
                  <img
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-md mt-2"
                  />
                )}
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter track title" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-muted/50 border border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter track description" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-muted/50 border border-border resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/50 border border-border">
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
      
      {/* Hidden close button for programmatic closing */}
      <DialogClose className="hidden" data-dialog-close />
    </DialogContent>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
