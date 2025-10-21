// This feature has been disabled due to technical issues.
export const useVoiceRecognition = () => ({
  isListening: false,
  transcript: '',
  error: 'Voice recognition is currently unavailable.',
  hasRecognitionSupport: false,
  startListening: () => {},
  stopListening: () => {},
});
