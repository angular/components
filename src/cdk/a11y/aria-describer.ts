/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId} from './aria-reference';

/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the same message and the reference to the message element used for the aria-describedby.
 */
export interface RegisteredMessage {
  messageElement: Element;
  referenceCount: number;
}

/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'cdk-describedby-message-container';

/** ID prefix used for each created message element. */
export const CDK_DESCRIBEDBY_ID_PREFIX = 'cdk-describedby-message';

/** Attribute given to each host element that is described by a message element. */
export const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = 'cdk-describedby-host';

/** Global incremental identifier for each registered message element. */
let nextId = 0;

/** Global map of all registered message elements that have been placed into the document. */
const messageRegistry = new Map<string, RegisteredMessage>();

/** Container for all registered messages. */
let messagesContainer: HTMLElement | null = null;

/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content.
 * @docs-private
 */
@Injectable()
export class AriaDescriber {
  constructor(private _platform: Platform) { }

  /**
   * Adds to the host element an aria-describedby reference to a hidden element that contains
   * the message. If the same message has already been registered, then it will reuse the created
   * message element.
   */
  describe(hostElement: Element, message: string) {
    if (!this._platform.isBrowser || !`${message}`.trim()) { return; }

    if (!messageRegistry.has(message)) {
      createMessageElement(message);
    }

    const registeredMessage = messageRegistry.get(message)!;
    registeredMessage.referenceCount++;
    addAriaReferencedId(hostElement, 'aria-describedby', registeredMessage.messageElement.id);
    hostElement.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, '');
  }

  /** Removes the host element's aria-describedby reference to the message element. */
  removeDescription(hostElement: Element, message: string) {
    if (!this._platform.isBrowser || !`${message}`.trim() ||
        hostElement.getAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE) == null) {
      return;
    }

    const registeredMessage = messageRegistry.get(message)!;
    registeredMessage.referenceCount--;

    removeAriaReferencedId(hostElement, 'aria-describedby', registeredMessage.messageElement.id);
    hostElement.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);

    if (registeredMessage.referenceCount === 0) {
      deleteMessageElement(message);
    }

    if (messagesContainer!.childNodes.length === 0) {
      deleteMessagesContainer();
    }
  }

  /** Unregisters all created message elements and removes the message container. */
  ngOnDestroy() {
    const describedElements = document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}]`);
    for (let i = 0; i < describedElements.length; i++) {
      removeCdkDescribedByReferenceIds(describedElements[i]);
      describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }

    if (messagesContainer) {
      deleteMessagesContainer();
    }

    messageRegistry.clear();
  }
}

/**
 * Creates a new element in the visually hidden message container element with the message
 * as its content and adds it to the message registry.
 */
function createMessageElement(message: string) {
  const messageElement = document.createElement('div');
  messageElement.setAttribute('id', `${CDK_DESCRIBEDBY_ID_PREFIX}-${nextId++}`);
  messageElement.appendChild(document.createTextNode(message)!);

  if (!messagesContainer) { createMessagesContainer(); }
  messagesContainer!.appendChild(messageElement);

  messageRegistry.set(message, {messageElement, referenceCount: 0});
}

/** Deletes the message element from the global messages container. */
function deleteMessageElement(message: string) {
  const messageElement = messageRegistry.get(message)!.messageElement;
  messagesContainer!.removeChild(messageElement);
  messageRegistry.delete(message);
}

/** Creates the global container for all aria-describedby messages. */
function createMessagesContainer() {
  messagesContainer = document.createElement('div');

  messagesContainer.setAttribute('id', MESSAGES_CONTAINER_ID);
  messagesContainer.setAttribute('aria-hidden', 'true');
  messagesContainer.style.display = 'none';
  document.body.appendChild(messagesContainer);
}

/** Deletes the global messages container. */
function deleteMessagesContainer() {
  document.body.removeChild(messagesContainer!);
  messagesContainer = null;
}

function removeCdkDescribedByReferenceIds(element: Element) {
  // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
  const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby')
      .filter(id => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
  element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
}
