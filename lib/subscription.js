
// lib/subscription.js
// This utility handles plan management and usage tracking with a smart fallback for Demo Mode.

const FREE_LIMIT = 5;

export const getSubscriptionStore = () => {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('promptpolish_sub');
    if (stored) return JSON.parse(stored);

    const initial = {
        plan: 'free',
        promptsUsed: 0,
        lastReset: new Date().toDateString(),
        isDemo: true
    };
    localStorage.setItem('promptpolish_sub', JSON.stringify(initial));
    return initial;
};

export const updateSubscriptionStore = (updates) => {
    if (typeof window === 'undefined') return;
    const current = getSubscriptionStore();
    const next = { ...current, ...updates };
    localStorage.setItem('promptpolish_sub', JSON.stringify(next));
    return next;
};

export const checkUsage = () => {
    const store = getSubscriptionStore();
    if (!store) return { allowed: true };

    // Reset usage if it's a new day
    const today = new Date().toDateString();
    if (store.lastReset !== today) {
        store.promptsUsed = 0;
        store.lastReset = today;
        updateSubscriptionStore(store);
    }

    if (store.plan === 'pro') return { allowed: true, plan: 'pro' };

    return {
        allowed: store.promptsUsed < FREE_LIMIT,
        remaining: FREE_LIMIT - store.promptsUsed,
        plan: 'free'
    };
};

export const incrementUsage = () => {
    const store = getSubscriptionStore();
    if (store && store.plan !== 'pro') {
        updateSubscriptionStore({ promptsUsed: store.promptsUsed + 1 });
    }
};

export const upgradeToPro = () => {
    updateSubscriptionStore({ plan: 'pro' });
};
