// useAuthStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TutorState {
  showChat: boolean;
  currentChat: Message[];
  openChat: () => void;
  closeChat: () => void;
  clearChat: () => void;
  addMessage: (messsage: Message) => void;
  changeLatestMessage: (message: Message) => void;
  showHint: (hint: string) => void;
}

export type Message = {
  sender: "user" | "bot";
  text: string;
  sources: MessageSource[];
};

export type MessageSource = {
  displayText: string;
  link: string;
};

export const useAITutorStore = create<TutorState>()(
  persist(
    (set) => ({
      showChat: false,
      currentChat: [],
      openChat: () => set({ showChat: true }),
      closeChat: () => set({ showChat: false }),
      clearChat: () => set({ currentChat: [] }),
      addMessage: (message: Message) =>
        set((state) => ({
          currentChat: [...state.currentChat, message],
        })),
      changeLatestMessage: (message: Message) =>
        set((state) => {
          if (state.currentChat.length === 0) return state;
          const updated = [...state.currentChat];
          updated[updated.length - 1] = message;
          return { currentChat: updated };
        }),
      showHint: (hint: string) =>
        set({
          showChat: true,
          currentChat: [
            {
              sender: "bot",
              sources: [],
              text: "Hint: \n" + hint,
            },
          ],
        }),
    }),
    {
      name: "tutor-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentChat: state.currentChat }) //only stores the currentChat
    }
  )
);
