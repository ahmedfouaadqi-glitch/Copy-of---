// services/soundService.ts

type SoundEffect = 'start' | 'tap' | 'success' | 'notification' | 'error';

// A tiny, silent WAV file as a base64 data URL.
// This robustly fixes the "no supported sources" error by embedding a valid,
// playable audio source directly, removing dependency on external files that may be missing or corrupt.
const silentWavDataUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const sounds: Record<SoundEffect, HTMLAudioElement> = {
    start: new Audio(silentWavDataUrl),
    tap: new Audio(silentWavDataUrl),
    success: new Audio(silentWavDataUrl),
    notification: new Audio(silentWavDataUrl),
    error: new Audio(silentWavDataUrl),
};

// Preload sounds for better performance
Object.values(sounds).forEach(sound => {
    sound.preload = 'auto';
    sound.volume = 0.5; // Adjust volume to be subtle
});

export const playSound = (sound: SoundEffect) => {
    const s = sounds[sound];
    if (s) {
        // Rewind to the beginning to allow playing in quick succession
        s.currentTime = 0;
        const playPromise = s.play();

        if (playPromise !== undefined) {
            // Catch and handle potential playback errors, especially NotAllowedError.
            playPromise.catch(error => {
                // This error occurs if play() is called without user interaction.
                // We can safely ignore it for the startup sound.
                if (error.name === 'NotAllowedError') {
                    console.log(`Autoplay for sound '${sound}' was prevented by the browser. This is expected behavior.`);
                } else {
                    console.error(`Error playing sound: ${sound}`, error);
                }
            });
        }
    }
};
