/**
 * Dialogue Converters
 *
 * Utilities for working with syllst DialogueNode.
 * 
 * NOTE: GLOST dialogue conversion functions are not included in this package
 * as they depend on external glost-dialogue packages. Those can be added
 * as a separate package or extension if needed.
 */

import type {
  DialogueNode,
} from '@syllst/core/types';

// ============================================================================
// Dialogue Utilities
// ============================================================================

/**
 * Extract dialogue statistics
 */
export function getDialogueStats(dialogue: DialogueNode): {
  turnCount: number;
  participantCount: number;
  hasGenderVariants: boolean;
  hasCulturalNotes: boolean;
} {
  return {
    turnCount: dialogue.children.length,
    participantCount: dialogue.participants.length,
    hasGenderVariants: dialogue.children.some((turn) => turn.genderVariants),
    hasCulturalNotes: !!dialogue.culturalNotes,
  };
}

// NOTE: GLOST dialogue conversion functions have been removed as they depend on
// external @lalia/glost-dialogue and glost-core packages. These can be added
// as a separate package or extension if needed.
