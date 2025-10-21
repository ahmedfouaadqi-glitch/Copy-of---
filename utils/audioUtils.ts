// This feature has been disabled due to technical issues.
export function decode(base64: string): Uint8Array { return new Uint8Array(); }
export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    return ctx.createBuffer(numChannels, 1, sampleRate);
}
export function encode(bytes: Uint8Array): string { return ''; }
export const playBase64Audio = async (base64String: string): Promise<AudioBufferSourceNode | null> => {
    console.warn("Audio playback is disabled.");
    return null;
};