'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  List,
  Map,
  MapPin,
  Navigation,
  Share2,
  Star,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Progress} from '@/components/ui/progress';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {MapContainer} from '@/components/map/MapContainer';

// Types
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type WaypointStatus = 'pending' | 'completed' | 'active';

interface Waypoint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
  status: WaypointStatus;
  imageUrl?: string;
  challenge?: string;
  hint?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  difficulty: Difficulty;
  distance: number;
  duration: number;
  rating: number;
  reviewCount: number;
  location: string;
  imageUrl: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    questsCompleted: number;
  };
  waypoints: Waypoint[];
  tags: string[];
  isBookmarked: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  startDate?: string;
  endDate?: string;
}

// Mock data generator
const generateMockQuest = (id: string): Quest => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const waypointsCount = Math.floor(Math.random() * 5) + 3; // 3-7 waypoints

  const waypoints: Waypoint[] = Array.from({length: waypointsCount}, (_, i) => ({
    id: `waypoint-${i + 1}`,
    title: `Waypoint ${i + 1}`,
    description: `This is waypoint ${i + 1}. Complete the challenge to continue your quest.`,
    latitude: 51.5074 + (Math.random() * 0.1 - 0.05), // Random location near London
    longitude: -0.1278 + (Math.random() * 0.1 - 0.05),
    order: i + 1,
    status: 'pending' as WaypointStatus,
    imageUrl: `https://picsum.photos/seed/waypoint-${i + 1}/800/400`,
    challenge: `Challenge ${i + 1}: Find the hidden marker and take a picture.`,
    hint: i % 2 === 0 ? 'Look for a blue sign' : 'Check near the main entrance',
  }));

  // Set first waypoint as active if quest is started
  if (Math.random() > 0.5) {
    waypoints[0].status = 'active';
  }

  return {
    id,
    title: `Epic Quest ${id.split('-')[1]}`,
    description: 'An amazing adventure that will test your skills and reward your courage.',
    longDescription:
        'Embark on this exciting journey through the city, solving puzzles and discovering hidden gems along the way. This quest will take you to some of the most interesting locations, each with its own unique challenge. Perfect for explorers of all ages!',
    difficulty,
    distance: Math.floor(Math.random() * 20) + 1,
    duration: Math.floor(Math.random() * 240) + 30,
    rating: Number((Math.random() * 3 + 2).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 100),
    location: ['Downtown', 'Mountains', 'Forest', 'Beach', 'City Center'][
        Math.floor(Math.random() * 5)
        ],
    imageUrl: `https://picsum.photos/seed/quest-${id}/1200/600`,
    author: {
      id: 'user-1',
      name: 'AdventureMaster',
      avatar: 'https://i.pravatar.cc/150?img=32',
      questsCompleted: Math.floor(Math.random() * 50) + 10,
    },
    waypoints,
    tags: ['Adventure', 'City', 'Puzzle'],
    isBookmarked: Math.random() > 0.5,
    isStarted: Math.random() > 0.5,
    isCompleted: Math.random() > 0.7,
  };
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  hard: 'bg-yellow-100 text-yellow-800',
  expert: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export default function QuestDetailPage() {
  const {id} = useParams();
  const router = useRouter();

  // State
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load quest data (real API)
  useEffect(() => {
    const controller = new AbortController();
    const loadQuest = async () => {
      try {
        setIsLoading(true);
        // Fetch quest
        const resQuest = await fetch(`/api/quests/${id}`, {signal: controller.signal});
        if (!resQuest.ok) throw new Error('Failed to load quest');
        const questRow = await resQuest.json();

        // Fetch waypoints
        const resWp = await fetch(`/api/quests/${id}/waypoints`, {signal: controller.signal});
        if (!resWp.ok) throw new Error('Failed to load waypoints');
        const waypointRows = await resWp.json();

        const waypoints: Waypoint[] = (waypointRows || []).map((wp: any, idx: number) => ({
          id: wp.id,
          title: wp.title ?? `Waypoint ${idx + 1}`,
          description: wp.description ?? '',
          latitude: wp.location?.coordinates?.[1] ?? 0,
          longitude: wp.location?.coordinates?.[0] ?? 0,
          order: wp.order_index ?? idx,
          status: idx === 0 ? 'active' : 'pending',
        }));

        const authorName = questRow?.created_by?.username ?? 'Unknown';
        const loc = questRow?.start_location?.coordinates
            ? `${questRow.start_location.coordinates[1].toFixed(4)}, ${questRow.start_location.coordinates[0].toFixed(4)}`
            : 'Unknown';

        const hydrated: Quest = {
          id: questRow.id,
          title: questRow.title,
          description: questRow.description ?? '',
          longDescription: questRow.description ?? '',
          difficulty: questRow.difficulty ?? 'medium',
          distance: 0,
          duration: questRow.estimated_duration_minutes ?? 0,
          rating: 5,
          reviewCount: 0,
          location: loc,
          imageUrl: 'https://picsum.photos/seed/quest/1200/600',
          author: {
            id: 'unknown',
            name: authorName,
            avatar: 'https://i.pravatar.cc/150?img=32',
            questsCompleted: 0,
          },
          waypoints,
          tags: [],
          isBookmarked: false,
          isStarted: false,
          isCompleted: false,
        };

        setQuest(hydrated);
        setIsBookmarked(hydrated.isBookmarked);

        if (waypoints.length > 0) setActiveWaypointIndex(0);
      } catch (err) {
        if ((err as any).name === 'AbortError') return;
        console.error('Error loading quest:', err);
        setError('Failed to load quest. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadQuest();
    }
    return () => controller.abort();
  }, [id]);

  // Handle waypoint completion
  const handleCompleteWaypoint = (waypointId: string) => {
    if (!quest) return;

    const updatedWaypoints = quest.waypoints.map((wp) => {
      if (wp.id === waypointId) {
        return {...wp, status: 'completed' as const};
      } else if (wp.order === quest.waypoints[activeWaypointIndex].order + 1) {
        return {...wp, status: 'active' as const};
      }
      return wp;
    });

    setQuest({
      ...quest,
      waypoints: updatedWaypoints,
      isStarted: true,
    });

    // Move to next waypoint if available
    if (activeWaypointIndex < quest.waypoints.length - 1) {
      setActiveWaypointIndex(activeWaypointIndex + 1);
    } else {
      // Quest completed
      setQuest((prev) => (prev ? {...prev, isCompleted: true} : null));
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically make an API call to update the bookmark status
  };

  // Share quest
  const shareQuest = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: quest?.title,
          text: `Check out this quest: ${quest?.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Calculate quest progress
  const progress = quest
      ? Math.round(
          (quest.waypoints.filter((wp) => wp.status === 'completed').length /
              quest.waypoints.length) *
          100
      )
      : 0;

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4"/>
              <Skeleton className="h-6 w-1/2"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-lg"/>
                <Skeleton className="h-32 w-full"/>
                <Skeleton className="h-64 w-full"/>
              </div>

              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg"/>
                <Skeleton className="h-32 w-full"/>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error || !quest) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold mb-2">Quest Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The quest you are looking for does not exist or has been removed.'}
            </p>
            <Button onClick={() => router.push('/quests')}>Back to Quests</Button>
          </div>
        </div>
    );
  }

  const activeWaypoint = quest.waypoints[activeWaypointIndex];
  const isLastWaypoint = activeWaypointIndex === quest.waypoints.length - 1;

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{quest.title}</h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1"/>
                <span>{quest.location}</span>
                <span className="mx-2">•</span>
                <span>
                {Math.floor(quest.duration / 60)}h {quest.duration % 60}m
              </span>
                <span className="mx-2">•</span>
                <Badge className={difficultyColors[quest.difficulty]}>
                  {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleBookmark}>
                <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`}/>
              </Button>
              <Button variant="outline" size="icon" onClick={shareQuest}>
                <Share2 className="h-5 w-5"/>
              </Button>
            </div>
          </div>

          {/* Progress */}
          {quest.isStarted && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
              <span className="font-medium">
                {quest.isCompleted ? 'Completed!' : 'Quest Progress'}
              </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2"/>
                <p className="text-sm text-muted-foreground">
                  {quest.waypoints.filter((wp) => wp.status === 'completed').length} of{' '}
                  {quest.waypoints.length} waypoints completed
                </p>
              </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quest Image */}
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
              <img src={quest.imageUrl} alt={quest.title} className="w-full h-full object-cover"/>
              {quest.isCompleted && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center p-6 bg-white/90 rounded-lg max-w-md">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                      <h3 className="text-xl font-bold mb-2">Quest Completed!</h3>
                      <p className="text-muted-foreground mb-4">
                        Congratulations on completing this adventure! Ready for your next challenge?
                      </p>
                      <Button onClick={() => router.push('/quests')}>Find Another Quest</Button>
                    </div>
                  </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs
                defaultValue="overview"
                className="w-full"
                onValueChange={setActiveTab}
                value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="waypoints" className="flex items-center gap-1">
                  Waypoints
                  {!quest.isCompleted && quest.isStarted && (
                      <span
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {quest.waypoints.length -
                        quest.waypoints.filter((wp) => wp.status === 'completed').length}
                  </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({quest.reviewCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-6 space-y-4">
                <h2 className="text-2xl font-bold">About This Quest</h2>
                <p className="text-muted-foreground">{quest.longDescription}</p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mt-6">What You'll Do</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Explore hidden gems and local landmarks</li>
                    <li>Solve puzzles and complete challenges</li>
                    <li>Learn interesting facts about the area</li>
                    <li>Create lasting memories with friends and family</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">Good to Know</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 mt-0.5 text-muted-foreground"/>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(quest.duration / 60)} hours {quest.duration % 60} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground"/>
                      <div>
                        <p className="font-medium">Distance</p>
                        <p className="text-sm text-muted-foreground">{quest.distance} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="waypoints" className="pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Waypoints</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="lg:hidden"
                    >
                      {showMap ? (
                          <>
                            <List className="h-4 w-4 mr-2"/>
                            Show List
                          </>
                      ) : (
                          <>
                            <Map className="h-4 w-4 mr-2"/>
                            Show Map
                          </>
                      )}
                    </Button>
                  </div>

                  {showMap && (
                      <div className="lg:hidden h-64 rounded-lg overflow-hidden border">
                        <MapContainer
                            initialViewState={{
                              latitude: activeWaypoint.latitude,
                              longitude: activeWaypoint.longitude,
                              zoom: 14,
                            }}
                            markers={quest.waypoints.map((wp) => ({
                              id: wp.id,
                              latitude: wp.latitude,
                              longitude: wp.longitude,
                              title: wp.title,
                              color:
                                  wp.id === activeWaypoint.id
                                      ? '#3b82f6'
                                      : wp.status === 'completed'
                                          ? '#10b981'
                                          : '#9ca3af',
                            }))}
                            interactive={true}
                            showCurrentLocation={true}
                        />
                      </div>
                  )}

                  <div className="space-y-4">
                    {quest.waypoints.map((waypoint, index) => (
                        <div
                            key={waypoint.id}
                            className={`p-4 rounded-lg border ${
                                waypoint.id === activeWaypoint.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-border'
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                      waypoint.status === 'completed'
                                          ? 'bg-green-100 text-green-600'
                                          : waypoint.status === 'active'
                                              ? 'bg-blue-100 text-blue-600'
                                              : 'bg-gray-100 text-gray-400'
                                  }`}
                              >
                                {waypoint.status === 'completed' ? (
                                    <CheckCircle className="h-5 w-5"/>
                                ) : (
                                    <span className="font-medium">{index + 1}</span>
                                )}
                              </div>
                              {index < quest.waypoints.length - 1 && (
                                  <div className="h-full w-0.5 bg-gray-200 my-2"></div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{waypoint.title}</h3>
                                <Badge variant="outline" className={statusColors[waypoint.status]}>
                                  {waypoint.status.charAt(0).toUpperCase() + waypoint.status.slice(1)}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mt-1">
                                {waypoint.description}
                              </p>

                              {waypoint.id === activeWaypoint.id && waypoint.challenge && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm font-medium">Your Challenge:</p>
                                    <p className="text-sm">{waypoint.challenge}</p>

                                    {waypoint.hint && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          <button className="flex items-center text-blue-600 hover:underline">
                                            Need a hint? <ChevronRight className="h-3 w-3"/>
                                          </button>
                                        </div>
                                    )}

                                    <Button
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => handleCompleteWaypoint(waypoint.id)}
                                    >
                                      Complete Challenge
                                    </Button>
                                  </div>
                              )}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Reviews</h2>
                      <div className="flex items-center mt-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400"/>
                        <span className="ml-1 font-medium">{quest.rating}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{quest.reviewCount} reviews</span>
                      </div>
                    </div>
                    <Button variant="outline">Write a Review</Button>
                  </div>

                  <div className="space-y-6">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="border-b pb-6">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`}/>
                              <AvatarFallback>U{i + 1}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">User {i + 1}</p>
                                <span className="text-muted-foreground text-sm">2 weeks ago</span>
                              </div>
                              <div className="flex items-center mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                              </div>
                              <p className="mt-1">
                                This was an amazing experience! The challenges were fun and the
                                locations were beautiful. Definitely recommend to anyone looking for an
                                adventure.
                              </p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Load More Reviews
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Map & Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            <div className="hidden lg:block h-80 rounded-lg overflow-hidden border">
              <MapContainer
                  initialViewState={{
                    latitude: activeWaypoint.latitude,
                    longitude: activeWaypoint.longitude,
                    zoom: 14,
                  }}
                  markers={quest.waypoints.map((wp) => ({
                    id: wp.id,
                    latitude: wp.latitude,
                    longitude: wp.longitude,
                    title: wp.title,
                    color:
                        wp.id === activeWaypoint.id
                            ? '#3b82f6'
                            : wp.status === 'completed'
                                ? '#10b981'
                                : '#9ca3af',
                  }))}
                  interactive={true}
                  showCurrentLocation={true}
              />
            </div>

            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Start Your Adventure</CardTitle>
                <CardDescription>
                  {quest.isStarted
                      ? 'Continue your journey or invite friends to join you.'
                      : 'Ready to begin? Start your quest now!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!quest.isCompleted && (
                    <Button className="w-full" size="lg">
                      {quest.isStarted ? 'Continue Quest' : 'Start Quest'}
                      <Flag className="ml-2 h-4 w-4"/>
                    </Button>
                )}

                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4"/>
                  Share with Friends
                </Button>

                {quest.isStarted && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-medium">Current Waypoint</h4>
                      <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-start gap-3">
                          <div
                              className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                            {activeWaypointIndex + 1}
                          </div>
                          <div>
                            <p className="font-medium">{activeWaypoint.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {activeWaypoint.description}
                            </p>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 mt-1 text-blue-600"
                                onClick={() => {
                                  setActiveTab('waypoints');
                                  // Scroll to waypoint
                                  const element = document.getElementById(
                                      `waypoint-${activeWaypoint.id}`
                                  );
                                  if (element) {
                                    element.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center',
                                    });
                                  }
                                }}
                            >
                              View details
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${activeWaypoint.latitude},${activeWaypoint.longitude}`,
                                    '_blank'
                                );
                              }}
                          >
                            <Navigation className="h-4 w-4 mr-2"/>
                            Directions
                          </Button>

                          <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCompleteWaypoint(activeWaypoint.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2"/>
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={quest.author.avatar}/>
                    <AvatarFallback>{quest.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{quest.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {quest.author.questsCompleted} quests created
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Similar Quests */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Quests</CardTitle>
                <CardDescription>You might also enjoy these adventures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => {
                  const similarQuest = generateMockQuest(`similar-${i}`);
                  return (
                      <div
                          key={i}
                          className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2"
                          onClick={() => router.push(`/quests/quest-${i}`)}
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                              src={similarQuest.imageUrl}
                              alt={similarQuest.title}
                              className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{similarQuest.title}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1"/>
                            <span>{similarQuest.location}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1"/>
                            <span className="text-xs">
                          {similarQuest.rating} ({similarQuest.reviewCount})
                        </span>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
