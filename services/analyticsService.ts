import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AnalyticsEvent {
    type: 'download_start' | 'download_complete' | 'download_failed' | 'download_paused';
    movieId: string;
    movieTitle: string;
    userId?: string;
    networkType: string;
    batteryLevel: number;
    timestamp: string;
}

export const analyticsService = {
    logEvent: async (event: Omit<AnalyticsEvent, 'timestamp'>) => {
        try {
            await addDoc(collection(db, 'analytics'), {
                ...event,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error("Analytics Error", e);
        }
    }
};
