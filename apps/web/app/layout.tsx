import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from 'sonner';
import './globals.css';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'QuestHunt - Your Geocaching Adventure',
    description: 'Discover, create, and share geocaching adventures with friends',
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: 'white'},
        {media: '(prefers-color-scheme: dark)', color: 'black'},
    ],
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster position="top-center" richColors/>
        </ThemeProvider>
        </body>
        </html>
    );
}
