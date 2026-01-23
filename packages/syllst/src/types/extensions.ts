/**
 * External Format Extensions
 *
 * Defines extension types for external curriculum formats (SCORM, xAPI, CMI5, etc.)
 * These extensions allow syllst nodes to carry format-specific metadata and configuration.
 */

/**
 * Base extension interface
 */
export interface BaseExtension {
  /** Extension format identifier */
  format: string;
  /** Format version */
  version?: string;
  /** Format-specific data */
  [key: string]: unknown;
}

/**
 * SCORM extension
 */
export interface SCORMExtension extends BaseExtension {
  format: 'scorm';
  version: '1.2' | '2004';
  /** SCORM manifest identifier */
  identifier?: string;
  /** SCORM item identifier */
  itemIdentifier?: string;
  /** SCORM launch parameters */
  launchParameters?: Record<string, string>;
}

/**
 * xAPI extension
 */
export interface xAPIExtension extends BaseExtension {
  format: 'xapi';
  /** xAPI activity ID */
  activityId?: string;
  /** xAPI activity type */
  activityType?: string;
  /** xAPI context extensions */
  contextExtensions?: Record<string, unknown>;
}

/**
 * CMI5 extension
 */
export interface CMI5Extension extends BaseExtension {
  format: 'cmi5';
  /** CMI5 Assignable Unit ID */
  auId?: string;
  /** CMI5 objective ID */
  objectiveId?: string;
  /** Mastery score for this objective (0-1) */
  masteryScore?: number;
  /** URL to the content launch */
  launchUrl?: string;
  /** Parameters for content launch */
  launchParameters?: string;
  /** Whether this AU is a primary objective */
  isPrimaryObjective?: boolean;
}

/**
 * IMS CC extension
 */
export interface IMSCCExtension extends BaseExtension {
  format: 'imscc';
  /** IMS CC identifier */
  identifier?: string;
  /** IMS CC resource type */
  resourceType?: string;
}

/**
 * QTI extension
 */
export interface QTIExtension extends BaseExtension {
  format: 'qti';
  /** QTI version */
  version: '2.1' | '2.2';
  /** QTI item identifier */
  itemIdentifier?: string;
  /** QTI assessment identifier */
  assessmentIdentifier?: string;
}

/**
 * LTI extension
 */
export interface LTIExtension extends BaseExtension {
  format: 'lti';
  /** LTI version */
  version: '1.0' | '1.1' | '1.2' | '1.3';
  /** LTI tool identifier */
  toolId?: string;
  /** LTI launch URL */
  launchUrl?: string;
}

/**
 * Union of all extension types
 */
export type NodeExtension =
  | SCORMExtension
  | xAPIExtension
  | CMI5Extension
  | IMSCCExtension
  | QTIExtension
  | LTIExtension;

/**
 * Extensions map (format -> extension)
 */
export type ExtensionsMap = {
  [K in NodeExtension['format']]?: Extract<NodeExtension, { format: K }>;
};
