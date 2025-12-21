'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {TipTapEditor} from '@/components/editor/TipTapEditor';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {MapContainer} from '@/components/map/MapContainer';
import {toast} from '@/components/ui/use-toast';

const questFormSchema = z.object({
    title: z.string().min(5, {message: 'Title must be at least 5 characters'}),
    description: z.string().min(20, {message: 'Description must be at least 20 characters'}),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    estimatedTime: z.number().min(1, {message: 'Estimated time must be at least 1 hour'}),
    waypoints: z.array(z.object({
        id: z.string(),
        title: z.string().min(3),
        description: z.string().min(10),
        latitude: z.number(),
        longitude: z.number(),
        order: z.number(),
    })).min(1, {message: 'At least one waypoint is required'}),
});

type QuestFormValues = z.infer<typeof questFormSchema>;

export default function CreateQuestPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const form = useForm<QuestFormValues>({
        resolver: zodResolver(questFormSchema),
        defaultValues: {
            title: '',
            description: '',
            difficulty: 'medium',
            estimatedTime: 1,
            waypoints: [],
        },
    });

    const onSubmit = async (data: QuestFormValues) => {
        try {
            setIsSubmitting(true);

            // Transform form data to API payload expected by /api/quests
            const payload = {
                title: data.title,
                description: data.description || '',
                difficulty: data.difficulty,
                status: 'draft' as const,
                start_location: null as any,
                estimated_duration_minutes: Number.isFinite(data.estimatedTime)
                    ? Math.max(1, Math.round((data.estimatedTime as number) * 60))
                    : null,
            };

            const response = await fetch('/api/quests', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error || 'Failed to create quest');
            }

            const result = await response.json();
            // Persist waypoints if any
            const waypoints = form.getValues('waypoints');
            if (Array.isArray(waypoints) && waypoints.length > 0) {
                try {
                    await Promise.all(
                        waypoints.map((wp) =>
                            fetch(`/api/quests/${result.id}/waypoints`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    title: wp.title || `Waypoint ${wp.order + 1}`,
                                    description: wp.description || '',
                                    location: {
                                        type: 'Point',
                                        coordinates: [wp.longitude, wp.latitude],
                                    },
                                    order_index: wp.order ?? 0,
                                }),
                            })
                        )
                    );
                } catch (e) {
                    console.error('Failed to persist some waypoints', e);
                }
            }
            toast({
                title: 'Quest created!',
                description: 'Your quest has been created successfully.',
            });
            router.push(`/quests/${result.id}`);
        } catch (error) {
            console.error('Error creating quest:', error);
            toast({
                title: 'Error',
                description: 'Failed to create quest. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMapClick = (e: any) => {
        const {lng, lat} = e.lngLat;
        const newWaypoint = {
            id: `wp-${Date.now()}`,
            title: `Waypoint ${form.getValues('waypoints').length + 1}`,
            description: '',
            latitude: lat,
            longitude: lng,
            order: form.getValues('waypoints').length,
        };
        form.setValue('waypoints', [...form.getValues('waypoints'), newWaypoint]);
    };

    const handleWaypointChange = (id: string, field: string, value: any) => {
        const waypoints = form.getValues('waypoints').map(wp =>
            wp.id === id ? {...wp, [field]: value} : wp
        );
        form.setValue('waypoints', waypoints);
    };

    const removeWaypoint = (id: string) => {
        const waypoints = form.getValues('waypoints').filter(wp => wp.id !== id);
        // Reindex order
        const reindexed = waypoints.map((wp, idx) => ({...wp, order: idx}));
        form.setValue('waypoints', reindexed);
    };

    const moveWaypoint = (id: string, direction: 'up' | 'down') => {
        const waypoints = [...form.getValues('waypoints')];
        const index = waypoints.findIndex(w => w.id === id);
        if (index === -1) return;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= waypoints.length) return;
        const tmp = waypoints[index];
        waypoints[index] = waypoints[target];
        waypoints[target] = tmp;
        // Update order values to match new positions
        const reindexed = waypoints.map((wp, idx) => ({...wp, order: idx}));
        form.setValue('waypoints', reindexed);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create a New Quest</h1>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        currentStep >= step
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {step}
                                </div>
                                <span className="text-sm mt-2">
                  {step === 1 ? 'Details' : step === 2 ? 'Waypoints' : 'Review'}
                </span>
                            </div>
                        ))}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-muted -z-10 mt-5">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{width: `${((currentStep - 1) / 2) * 100}%`}}
                            />
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Quest Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter quest title" {...field} />
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
                                                <div>
                                                    <TipTapEditor
                                                        value={field.value || ''}
                                                        onChange={(html) => field.onChange(html)}
                                                        placeholder="Describe your quest in detail..."
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Difficulty</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select difficulty"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="easy">Easy</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="hard">Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="estimatedTime"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Estimated Time (hours)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="h-[400px] rounded-lg overflow-hidden border">
                                    <MapContainer
                                        initialViewState={{
                                            latitude: 0,
                                            longitude: 0,
                                            zoom: 2,
                                        }}
                                        markers={form.getValues('waypoints').map(wp => ({
                                            id: wp.id,
                                            title: wp.title,
                                            latitude: wp.latitude,
                                            longitude: wp.longitude,
                                        }))}
                                        onMapClick={handleMapClick}
                                        className="h-full w-full"
                                        showCurrentLocation={true}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Waypoints
                                        ({form.getValues('waypoints').length})</h3>

                                    {form.getValues('waypoints').length === 0 ? (
                                        <div className="text-center py-8 border rounded-lg">
                                            <p className="text-muted-foreground">Click on the map to add waypoints</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {form.getValues('waypoints').map((waypoint, index) => (
                                                <div key={waypoint.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <h4 className="font-medium">Waypoint {index + 1}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Button type="button" variant="outline" size="sm"
                                                                    disabled={index === 0}
                                                                    onClick={() => moveWaypoint(waypoint.id, 'up')}>Up</Button>
                                                            <Button type="button" variant="outline" size="sm"
                                                                    disabled={index === form.getValues('waypoints').length - 1}
                                                                    onClick={() => moveWaypoint(waypoint.id, 'down')}>Down</Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeWaypoint(waypoint.id)}
                                                                className="text-destructive hover:bg-destructive/10"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <Input
                                                        placeholder="Waypoint name"
                                                        value={waypoint.title}
                                                        onChange={(e) => handleWaypointChange(waypoint.id, 'title', e.target.value)}
                                                    />

                                                    <Textarea
                                                        placeholder="Description (what should the user do here?)"
                                                        value={waypoint.description}
                                                        onChange={(e) => handleWaypointChange(waypoint.id, 'description', e.target.value)}
                                                        className="min-h-[100px]"
                                                    />

                                                    <div className="text-sm text-muted-foreground">
                                                        Location: {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Review Your Quest</h3>
                                    <p className="text-muted-foreground">
                                        Please review all the information below before submitting your quest.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="border rounded-lg p-6 space-y-4">
                                        <h4 className="text-lg font-medium">{form.getValues('title')}</h4>
                                        <p className="text-muted-foreground">{form.getValues('description')}</p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-medium mr-2">Difficulty:</span>
                                                <span className="capitalize">{form.getValues('difficulty')}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium mr-2">Estimated Time:</span>
                                                <span>{form.getValues('estimatedTime')} hours</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium mr-2">Waypoints:</span>
                                                <span>{form.getValues('waypoints').length} locations</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[300px] rounded-lg overflow-hidden border">
                                        <MapContainer
                                            initialViewState={{
                                                latitude: form.getValues('waypoints')[0]?.latitude || 0,
                                                longitude: form.getValues('waypoints')[0]?.longitude || 0,
                                                zoom: form.getValues('waypoints').length > 0 ? 12 : 2,
                                            }}
                                            markers={form.getValues('waypoints').map((wp, i) => ({
                                                id: wp.id,
                                                title: wp.title || `Waypoint ${i + 1}`,
                                                latitude: wp.latitude,
                                                longitude: wp.longitude,
                                            }))}
                                            interactive={false}
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </Button>

                            {currentStep < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating Quest...' : 'Create Quest'}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
