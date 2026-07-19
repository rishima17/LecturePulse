import { useState, useEffect, useCallback } from "react";
import { getReactions, addReaction } from "@/utils/reactionStorage";
import { socket } from "@/lib/socket";

/**
 * Custom hook to manage real-time reaction stream.
 * @param {string} sessionCode 
 * @param {string} lectureId 
 * @param {boolean} isTeacher 
 * @returns {{ reactions: import("@/types/reaction").ReactionCounts, sendReaction: (reactionType: string) => void }}
 */
export default function useReactions(sessionCode, lectureId, isTeacher) {
  const [reactions, setReactions] = useState(() => getReactions(sessionCode));

  // Sync state when sessionCode changes
  useEffect(() => {
    setReactions(getReactions(sessionCode));
  }, [sessionCode]);

  useEffect(() => {
    if (!sessionCode) return;

    // Handle local updates (same-tab custom events)
    const handleLocalUpdate = (e) => {
      if (e.detail && e.detail.sessionCode === sessionCode) {
        setReactions(e.detail.reactions || getReactions(sessionCode));
      }
    };

    // Handle cross-tab storage changes
    const handleStorageUpdate = (e) => {
      const targetKey = `lecturePulse_reactions_${sessionCode}`;
      if (e.key === targetKey) {
        setReactions(getReactions(sessionCode));
      }
    };

    window.addEventListener("reactions-updated", handleLocalUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    // Socket listeners for real-time synchronization
    const handleSocketReaction = (data) => {
      const { reactionType } = data;
      // If teacher receives a socket reaction, persist it and update state
      if (isTeacher) {
        const updated = addReaction(sessionCode, reactionType);
        setReactions(updated);
        window.dispatchEvent(
          new CustomEvent("reactions-updated", {
            detail: { sessionCode, reactionType, reactions: updated },
          })
        );
      }
    };

    if (socket) {
      socket.on("reaction-updated", handleSocketReaction);
    }

    return () => {
      window.removeEventListener("reactions-updated", handleLocalUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
      if (socket) {
        socket.off("reaction-updated", handleSocketReaction);
      }
    };
  }, [sessionCode, isTeacher]);

  const sendReaction = useCallback(
    (reactionType) => {
      if (!sessionCode) return;

      // 1. Emit to WebSocket room if connected
      if (socket && socket.connected) {
        socket.emit("submit-reaction", { lectureId, reactionType });
      } else {
        // 2. Fallback to updating localStorage directly for same-browser demo compatibility
        const updated = addReaction(sessionCode, reactionType);
        setReactions(updated);
        window.dispatchEvent(
          new CustomEvent("reactions-updated", {
            detail: { sessionCode, reactionType, reactions: updated },
          })
        );
      }
    },
    [sessionCode, lectureId]
  );

  return {
    reactions,
    sendReaction,
  };
}
