/**
 * Type declarations for packages without types
 */

declare module "@elizaos/plugin-bootstrap" {
  import type { Plugin, Provider, Action, Evaluator } from "@elizaos/core";

  // Re-export types
  export const bootstrapPlugin: Plugin;

  // Actions
  export const replyAction: Action;
  export const followRoomAction: Action;
  export const unfollowRoomAction: Action;
  export const ignoreAction: Action;
  export const noneAction: Action;
  export const muteRoomAction: Action;
  export const unmuteRoomAction: Action;
  export const sendMessageAction: Action;
  export const updateEntityAction: Action;
  export const choiceAction: Action;
  export const updateRoleAction: Action;
  export const updateSettingsAction: Action;
  export const generateImageAction: Action;

  // Evaluators
  export const reflectionEvaluator: Evaluator;

  // Providers
  export const evaluatorsProvider: Provider;
  export const anxietyProvider: Provider;
  export const timeProvider: Provider;
  export const entitiesProvider: Provider;
  export const relationshipsProvider: Provider;
  export const choiceProvider: Provider;
  export const factsProvider: Provider;
  export const roleProvider: Provider;
  export const settingsProvider: Provider;
  export const attachmentsProvider: Provider;
  export const providersProvider: Provider;
  export const actionsProvider: Provider;
  export const actionStateProvider: Provider;
  export const characterProvider: Provider;
  export const recentMessagesProvider: Provider;
  export const worldProvider: Provider;

  // Utility functions
  export function fetchMediaData(attachments: unknown[]): Promise<unknown[]>;
  export function processAttachments(
    attachments: unknown[],
    runtime: unknown
  ): Promise<unknown[]>;
  export function shouldRespond(
    runtime: unknown,
    message: unknown,
    room?: unknown,
    mentionContext?: unknown
  ): { shouldRespond: boolean; skipEvaluation: boolean; reason: string };
}
