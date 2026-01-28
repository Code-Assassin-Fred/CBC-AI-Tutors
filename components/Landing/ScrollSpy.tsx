"use client";

import { useEffect } from 'react';

export default function ScrollSpy() {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper part of the viewport
            threshold: 0,
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    if (id && id !== 'home') {
                        window.history.replaceState(null, '', `#${id}`);
                    } else if (id === 'home') {
                        window.history.replaceState(null, '', '/');
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Targeted IDs to track
        const targetIds = ['home', 'about', 'features', 'pricing', 'reviews', 'contact'];

        targetIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        // Also handle the case where we are at the very top
        const handleScroll = () => {
            if (window.scrollY < 100) {
                if (window.location.hash) {
                    window.history.replaceState(null, '', '/');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return null;
}
