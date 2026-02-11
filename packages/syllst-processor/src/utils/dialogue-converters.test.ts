/**
 * Dialogue Converters Tests
 *
 * Tests for dialogue utility functions.
 */

import { describe, it, expect } from 'vitest';
import { getDialogueStats } from './dialogue-converters';
import type { DialogueNode } from '@syllst/core/types';

// ============================================================================
// Test Fixtures
// ============================================================================

const createDialogueTurn = (overrides = {}): DialogueNode['children'][number] => ({
  type: 'dialogueTurn',
  speakerId: 'speaker-1',
  text: 'สวัสดีครับ',
  translation: 'Hello (polite)',
  ...overrides,
});

const createDialogue = (overrides = {}): DialogueNode => ({
  type: 'dialogue',
  id: 'dialogue-1',
  participants: [{ id: 'speaker-1', name: 'Person A' }],
  children: [createDialogueTurn()],
  ...overrides,
});

// ============================================================================
// getDialogueStats
// ============================================================================

describe('getDialogueStats', () => {
  describe('turn counting', () => {
    it('should return 0 turns for empty dialogue', () => {
      const dialogue = createDialogue({ children: [] });

      const stats = getDialogueStats(dialogue);

      expect(stats.turnCount).toBe(0);
    });

    it('should count single turn', () => {
      const dialogue = createDialogue();

      const stats = getDialogueStats(dialogue);

      expect(stats.turnCount).toBe(1);
    });

    it('should count multiple turns', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({ speakerId: 'a', text: 'Hello' }),
          createDialogueTurn({ speakerId: 'b', text: 'Hi there' }),
          createDialogueTurn({ speakerId: 'a', text: 'How are you?' }),
          createDialogueTurn({ speakerId: 'b', text: 'Good, thanks!' }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.turnCount).toBe(4);
    });
  });

  describe('participant counting', () => {
    it('should return 0 participants for empty participants array', () => {
      const dialogue = createDialogue({ participants: [] });

      const stats = getDialogueStats(dialogue);

      expect(stats.participantCount).toBe(0);
    });

    it('should count single participant', () => {
      const dialogue = createDialogue({
        participants: [{ id: 'speaker-1', name: 'John' }],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.participantCount).toBe(1);
    });

    it('should count multiple participants', () => {
      const dialogue = createDialogue({
        participants: [
          { id: 'customer', name: 'Customer' },
          { id: 'vendor', name: 'Vendor' },
          { id: 'bystander', name: 'Bystander' },
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.participantCount).toBe(3);
    });
  });

  describe('gender variants detection', () => {
    it('should return false when no turns have gender variants', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({ text: 'Hello' }),
          createDialogueTurn({ text: 'Hi' }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasGenderVariants).toBe(false);
    });

    it('should return true when any turn has gender variants', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({ text: 'Hello' }),
          createDialogueTurn({
            text: 'สวัสดีครับ/ค่ะ',
            genderVariants: {
              male: 'สวัสดีครับ',
              female: 'สวัสดีค่ะ',
            },
          }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasGenderVariants).toBe(true);
    });

    it('should return true when multiple turns have gender variants', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({
            text: 'Turn 1',
            genderVariants: { male: 'M1', female: 'F1' },
          }),
          createDialogueTurn({
            text: 'Turn 2',
            genderVariants: { male: 'M2', female: 'F2' },
          }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasGenderVariants).toBe(true);
    });

    it('should handle empty gender variants object', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({
            text: 'Hello',
            genderVariants: {},
          }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      // Empty object is still truthy, so this should be true
      expect(stats.hasGenderVariants).toBe(true);
    });

    it('should return false for undefined gender variants', () => {
      const dialogue = createDialogue({
        children: [
          createDialogueTurn({
            text: 'Hello',
            genderVariants: undefined,
          }),
        ],
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasGenderVariants).toBe(false);
    });
  });

  describe('cultural notes detection', () => {
    it('should return false when no cultural notes', () => {
      const dialogue = createDialogue();

      const stats = getDialogueStats(dialogue);

      expect(stats.hasCulturalNotes).toBe(false);
    });

    it('should return true when cultural notes present', () => {
      const dialogue = createDialogue({
        culturalNotes: 'In Thai culture, the wai is used as a greeting.',
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasCulturalNotes).toBe(true);
    });

    it('should return false for empty string cultural notes', () => {
      const dialogue = createDialogue({
        culturalNotes: '',
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasCulturalNotes).toBe(false);
    });

    it('should return false for undefined cultural notes', () => {
      const dialogue = createDialogue({
        culturalNotes: undefined,
      });

      const stats = getDialogueStats(dialogue);

      expect(stats.hasCulturalNotes).toBe(false);
    });
  });

  describe('combined stats', () => {
    it('should return all stats for complex dialogue', () => {
      const dialogue = createDialogue({
        participants: [
          { id: 'customer', name: 'Customer', role: 'buyer' },
          { id: 'vendor', name: 'Street Vendor', role: 'seller' },
        ],
        children: [
          createDialogueTurn({
            speakerId: 'customer',
            text: 'ราคาเท่าไหร่ครับ',
            translation: 'How much is it?',
          }),
          createDialogueTurn({
            speakerId: 'vendor',
            text: 'ร้อยบาทค่ะ',
            translation: '100 baht',
            genderVariants: {
              male: 'ร้อยบาทครับ',
              female: 'ร้อยบาทค่ะ',
            },
          }),
          createDialogueTurn({
            speakerId: 'customer',
            text: 'ลดได้ไหมครับ',
            translation: 'Can you give a discount?',
          }),
        ],
        culturalNotes: 'Bargaining is common at Thai markets.',
      });

      const stats = getDialogueStats(dialogue);

      expect(stats).toEqual({
        turnCount: 3,
        participantCount: 2,
        hasGenderVariants: true,
        hasCulturalNotes: true,
      });
    });

    it('should handle minimal valid dialogue', () => {
      const minimalDialogue: DialogueNode = {
        type: 'dialogue',
        id: 'minimal',
        participants: [],
        children: [],
      };

      const stats = getDialogueStats(minimalDialogue);

      expect(stats).toEqual({
        turnCount: 0,
        participantCount: 0,
        hasGenderVariants: false,
        hasCulturalNotes: false,
      });
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Edge cases', () => {
  it('should handle dialogue with only participants (no turns)', () => {
    const dialogue = createDialogue({
      participants: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ],
      children: [],
    });

    const stats = getDialogueStats(dialogue);

    expect(stats.turnCount).toBe(0);
    expect(stats.participantCount).toBe(2);
  });

  it('should handle dialogue with many turns', () => {
    const manyTurns = Array.from({ length: 100 }, (_, i) =>
      createDialogueTurn({ speakerId: `speaker-${i % 3}`, text: `Turn ${i}` })
    );

    const dialogue = createDialogue({ children: manyTurns });

    const stats = getDialogueStats(dialogue);

    expect(stats.turnCount).toBe(100);
  });

  it('should handle participant with minimal data', () => {
    const dialogue = createDialogue({
      participants: [{ id: 'anon' }], // Only id, no name or role
    });

    const stats = getDialogueStats(dialogue);

    expect(stats.participantCount).toBe(1);
  });
});

// ============================================================================
// Real-world Scenarios
// ============================================================================

describe('Real-world scenarios', () => {
  it('should handle Thai market negotiation dialogue', () => {
    const marketDialogue: DialogueNode = {
      type: 'dialogue',
      id: 'market-negotiation',
      lang: 'th',
      context: 'At a Thai street market',
      participants: [
        { id: 'tourist', name: 'Tourist', role: 'buyer' },
        { id: 'vendor', name: 'Vendor', role: 'seller' },
      ],
      culturalNotes:
        'Bargaining is expected at Thai markets. Start by offering 50-60% of the asking price.',
      children: [
        {
          type: 'dialogueTurn',
          speakerId: 'tourist',
          text: 'อันนี้เท่าไหร่ครับ',
          transcription: { primary: 'an-níi thâo-rài khráp' },
          translation: 'How much is this?',
        },
        {
          type: 'dialogueTurn',
          speakerId: 'vendor',
          text: 'สามร้อยบาทค่ะ',
          transcription: { primary: 'sǎam-rói bàat khâ' },
          translation: '300 baht',
          genderVariants: {
            male: 'สามร้อยบาทครับ',
            female: 'สามร้อยบาทค่ะ',
          },
        },
        {
          type: 'dialogueTurn',
          speakerId: 'tourist',
          text: 'แพงไปครับ ร้อยห้าสิบได้ไหม',
          transcription: { primary: 'phaaeng pai khráp, rói-hâa-sìp dâai mái' },
          translation: "That's too expensive. How about 150?",
        },
        {
          type: 'dialogueTurn',
          speakerId: 'vendor',
          text: 'ได้ค่ะ สองร้อยห้าสิบ',
          transcription: { primary: 'dâai khâ, sǎawng-rói-hâa-sìp' },
          translation: 'OK, 250',
          genderVariants: {
            male: 'ได้ครับ สองร้อยห้าสิบ',
            female: 'ได้ค่ะ สองร้อยห้าสิบ',
          },
        },
      ],
    };

    const stats = getDialogueStats(marketDialogue);

    expect(stats.turnCount).toBe(4);
    expect(stats.participantCount).toBe(2);
    expect(stats.hasGenderVariants).toBe(true);
    expect(stats.hasCulturalNotes).toBe(true);
  });

  it('should handle Japanese formal business dialogue', () => {
    const businessDialogue: DialogueNode = {
      type: 'dialogue',
      id: 'business-intro',
      lang: 'ja',
      context: 'First business meeting introduction',
      participants: [
        { id: 'tanaka', name: '田中' },
        { id: 'suzuki', name: '鈴木' },
      ],
      culturalNotes:
        'Business card exchange (meishi koukan) is a formal ritual in Japan.',
      children: [
        {
          type: 'dialogueTurn',
          speakerId: 'tanaka',
          text: 'はじめまして。田中と申します。',
          translation: 'Nice to meet you. My name is Tanaka.',
        },
        {
          type: 'dialogueTurn',
          speakerId: 'suzuki',
          text: 'はじめまして。鈴木です。よろしくお願いします。',
          translation:
            'Nice to meet you. I am Suzuki. Please treat me kindly.',
        },
      ],
    };

    const stats = getDialogueStats(businessDialogue);

    expect(stats.turnCount).toBe(2);
    expect(stats.participantCount).toBe(2);
    expect(stats.hasGenderVariants).toBe(false);
    expect(stats.hasCulturalNotes).toBe(true);
  });
});
