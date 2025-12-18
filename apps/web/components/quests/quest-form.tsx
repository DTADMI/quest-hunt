// B:\git\quest-hunt\apps\web\components\quests\quest-form.tsx
'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {toast} from 'sonner';
import {Loader2, MapPin} from 'lucide-react';
import * as z from 'zod';

const questFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    status: z.enum(['draft', 'published']),
    start_latitude: z.number().optional(),
    start_longitude: z.number().optional(),
    estimated_duration_minutes: z.number().min(1).optional(),
});

type QuestFormValues = z.infer<typeof questFormSchema>;

interface QuestFormProps {
    initialData?: Partial<QuestFormValues>;
    onSubmit: (data: QuestFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function QuestForm({initialData, onSubmit, isSubmitting}: QuestFormProps) {
    const router = useRouter();
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const form = useForm<QuestFormValues>({
        resolver: zodResolver(questFormSchema),
        defaultValues: initialData || {
            title: '',
            description: '',
            difficulty: 'medium',
            status: 'draft',
            estimated_duration_minutes: 60,
        },
    });

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    form.setValue('start_latitude', position.coords.latitude);
                    form.setValue('start_longitude', position.coords.longitude);
                    toast.success('Location captured successfully!');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Failed to get your location. Please try again.');
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="Amazing Treasure Hunt" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell participants what this quest is about..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Difficulty</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="estimated_duration_minutes"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Estimated Duration (minutes)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel>Starting Location</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                        >
                            <MapPin className="h-4 w-4 mr-2"/>
                            {currentLocation ? 'Update My Location' : 'Use My Current Location'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="start_latitude"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value ? Number(e.target.value) : undefined
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="start_longitude"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value ? Number(e.target.value) : undefined
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        )}
                        {initialData?.id ? 'Update Quest' : 'Create Quest'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}