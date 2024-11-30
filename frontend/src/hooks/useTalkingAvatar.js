import create from "zustand";

export const avatars = ["Ananya", "Aarav"];

export const useTalkingAvatar = create((set, get) => ({
  isVideoPlaying: false,
  setIsVideoPlaying: (isPlaying) => set({ isVideoPlaying: isPlaying }),

  avatar: avatars[0],
  setAvatar: (avatar) => {
    set(() => ({
      avatar,
    }));
  },

  visemes: null,
  setVisemes: (visemes) => {
    set(() => {
      visemes;
    });
  },

  videoRef: null,
  setVideoRef: (ref) => set({ videoRef: ref }),

  playVideo: async (message) => {
    if (!message.audioPlayer) {
      set(() => ({
        loading: true,
      }));
      // Get TTS
      const audioRes = await fetch("http://127.0.0.1:8000/tts/", {
        body: JSON.stringify({
          teacher: get().teacher,
          text: message.answer,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const visemes = audioRes.headers.get("visemes");

      message.visemes = JSON.parse(visemes);
    }
  },
  pauseVideo: (message) => {
    message.audioPlayer.pause();
    set(() => ({
      currentMessage: null,
    }));
  },
}));
