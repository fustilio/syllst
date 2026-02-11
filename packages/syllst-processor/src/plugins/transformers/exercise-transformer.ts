/**
 * Exercise Directive Transformer
 *
 * Handles: :::exercise
 */

import { toString } from "mdast-util-to-string";
import type { DirectiveTransformer } from "./directive-transformer.js";
import type { DirectiveNode } from "./shared/types.js";
import type { ExerciseNode } from "@syllst/core/types";
import {
  parseListItems,
  extractListText,
} from "./shared/helpers.js";

function transformExercise(
  directive: DirectiveNode
): Partial<ExerciseNode> {
  const {
    id = `exercise-${Math.random().toString(36).substr(2, 9)}`,
    type: exerciseType = "open-ended",
    title,
    difficulty,
    skill,
    tests,
    objectiveId,
  } = directive.attributes || {};

  let instructions = "";
  let questionItems: string[] = [];
  let answerItems: string[] = [];
  let explanation = "";
  const options: string[] = [];
  const items: { question: string; answer: string }[] = [];

  if (directive.children) {
    let currentSection = "";
    const sections: { [key: string]: string } = {};
    const listContent: { [key: string]: string } = {};

    for (const child of directive.children) {
      if (child.type === "paragraph") {
        const text = toString(child);
        if (text.startsWith("Question:")) {
          currentSection = "question";
          sections.question = text
            .replace("Question:", "")
            .trim();
        } else if (text.startsWith("Instructions:")) {
          currentSection = "question";
          instructions = text
            .replace("Instructions:", "")
            .trim();
        } else if (
          text.startsWith("Options:") ||
          text.startsWith("?options:")
        ) {
          currentSection = "options";
          if (text.startsWith("?options:")) {
            const optionsText = text
              .replace(/^\?options:\s*/i, "")
              .trim();
            if (optionsText) {
              const parsedOptions = optionsText
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt);
              options.push(...parsedOptions);
            }
          }
        } else if (
          text.startsWith("Answer:") ||
          text.startsWith("?answer:")
        ) {
          currentSection = "answer";
          const answerText = text
            .replace(/^(Answer:|Answers:|\?answer:)\s*/i, "")
            .trim();
          sections.answer = answerText;
        } else if (text.startsWith("Answers:")) {
          currentSection = "answer";
          sections.answer = text
            .replace("Answers:", "")
            .trim();
        } else if (text.startsWith("Explanation:")) {
          currentSection = "explanation";
          sections.explanation = text
            .replace("Explanation:", "")
            .trim();
        } else if (text.startsWith("Example:")) {
          currentSection = "example";
          sections.example = text
            .replace("Example:", "")
            .trim();
        } else if (currentSection && text.trim()) {
          sections[currentSection] =
            (sections[currentSection] || "") + "\n" + text;
        } else if (
          !currentSection &&
          text.trim() &&
          !text.startsWith("?")
        ) {
          if (!instructions && !sections.question) {
            currentSection = "question";
            sections.question = text.trim();
            instructions = text.trim();
          }
        }
      } else if (child.type === "list") {
        const listText = extractListText(child);
        if (currentSection) {
          listContent[currentSection] =
            (listContent[currentSection] || "") +
            "\n" +
            listText;
        }
      }
    }

    if (listContent.options) {
      const parsedOptions = parseListItems(
        listContent.options
      );
      options.push(...parsedOptions);
    }

    if (listContent.question) {
      questionItems = parseListItems(listContent.question);
    }

    if (listContent.answer) {
      answerItems = parseListItems(listContent.answer);
    } else if (sections.answer) {
      const answerText = sections.answer.trim();
      if (
        exerciseType === "multiple-choice" &&
        options.length > 0
      ) {
        const answerIndex = parseInt(answerText, 10);
        if (
          !isNaN(answerIndex) &&
          answerIndex >= 1 &&
          answerIndex <= options.length
        ) {
          answerItems = [options[answerIndex - 1]!];
        } else {
          answerItems = [answerText];
        }
      } else {
        answerItems = parseListItems(answerText);
      }
    }

    if (!instructions) {
      instructions =
        sections.question || sections.example || "";
    }

    explanation = sections.explanation || "";

    if (
      questionItems.length > 0 &&
      answerItems.length > 0
    ) {
      for (
        let i = 0;
        i <
        Math.max(questionItems.length, answerItems.length);
        i++
      ) {
        items.push({
          question: questionItems[i] || "",
          answer: answerItems[i] || "",
        });
      }
    }

    if (
      exerciseType === "dialogue" &&
      listContent.example &&
      items.length === 0
    ) {
      const dialogueLines = parseListItems(
        listContent.example
      );
      for (const line of dialogueLines) {
        items.push({ question: line, answer: "" });
      }
    }

    if (
      exerciseType === "multiple-choice" &&
      items.length === 0 &&
      instructions &&
      answerItems.length > 0
    ) {
      items.push({
        question: instructions,
        answer: answerItems[0] || "",
      });
    }
  }

  return {
    type: "exercise",
    id,
    title,
    exerciseType: exerciseType as any,
    question: instructions,
    items: items.length > 0 ? items : undefined,
    options: options.length > 0 ? options : undefined,
    answer:
      answerItems.length > 0
        ? answerItems.length === 1
          ? answerItems[0]
          : answerItems.join("\n")
        : "",
    explanation,
    difficulty: difficulty as
      | "beginner"
      | "intermediate"
      | "advanced"
      | undefined,
    skill,
    tests: tests
      ? tests.split(",").map((t) => t.trim())
      : undefined,
    objectiveId,
    children: [],
  };
}

export const exerciseTransformer: DirectiveTransformer = {
  name: "exercise",
  directives: ["exercise"],

  canHandle(name: string): boolean {
    return name === "exercise";
  },

  transform(directive: DirectiveNode) {
    return transformExercise(directive);
  },
};
