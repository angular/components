/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Optional, Renderer2} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {addAriaReferencedId, removeAriaReferencedId} from './aria-reference';

/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the same message and the reference to the message element used for the aria-describedby.
 */
export interface RegisteredMessage {
  messageElement: HTMLElement;
  hostElements: HTMLElement[];
}

/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'cdk-aria-describedby-messages';

/** Global incremental identifier for each registered message element. */
let nextId = 0;

/** Global map of all registered message elements that have been placed into the document. */
const registeredMessages = new Map<string, RegisteredMessage>();

/** Container for all registered messages. */
let messagesContainer: HTMLElement | null = null;

/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content. Must be provided with as part of a component's injection tree so that it has access
 * to the Renderer.
 */
@Injectable()
export class AriaDescriber {
  constructor(private _platform: Platform,
              @Optional() private _renderer: Renderer2) {
    if (!_renderer) {
      throw Error('AriaDescriber must be provided through a component\'s provider decorator ' +
          'so that it has access to the Angular Renderer');
    }
  }

  /**
   * Adds to the host element an aria-describedby reference to a hidden element that contains
   * the message. If the same message has already been registered, then it will reuse the created
   * message element.
   */
  addDescription(hostElement: HTMLElement, message: string) {
    if (!this._platform.isBrowser || !message.trim()) { return; }

    if (!registeredMessages.get(message)) {
      const messageElement = this._createMessageElement(message);
      registeredMessages.set(message, {messageElement, hostElements: []});
    }

    const registeredMessage = registeredMessages.get(message)!;
    registeredMessage.hostElements.push(hostElement);
    addAriaReferencedId(hostElement, registeredMessage.messageElement.id, 'aria-describedby');
  }

  /**
   * Removes the host element's aria-describedby reference to the message element.
   */
  removeDescription(hostElement: HTMLElement, message: string) {
    if (!this._platform.isBrowser || !message.trim()) { return; }

    const registeredMessage = registeredMessages.get(message)!;
    registeredMessage.hostElements = registeredMessage.hostElements.filter(el => el != hostElement);
    removeAriaReferencedId(hostElement, registeredMessage.messageElement.id, 'aria-describedby');

    if (registeredMessage.hostElements.length == 0) {
      this._deleteMessageElement(message);
    }

    if (messagesContainer!.childNodes.length == 0) {
      this._deleteMessagesContainer();
    }
  }

  /** Unregisters all created message elements and removes the message container. */
  _unregisterAllMessages() {
    registeredMessages.forEach((registeredMessage, message) => {
      registeredMessage.hostElements.forEach(hostElement => {
        this.removeDescription(hostElement, message);
      });
    });

    registeredMessages.clear();
  }

  /**
   * Creates a new element in the visually hidden message container element with the message
   * as its content.
   */
  private _createMessageElement(message: string): HTMLElement {
    const messageElement = this._renderer.createElement('div');
    this._renderer.setAttribute(messageElement, 'id', `cdk-aria-describedby-message-${nextId++}`);
    this._renderer.appendChild(messageElement, this._renderer.createText(message));

    if (!messagesContainer) { this._createMessagesContainer(); }
    this._renderer.appendChild(messagesContainer, messageElement);

    return messageElement;
  }

  /** Deletes the message element from the global messages container. */
  private _deleteMessageElement(message: string) {
    const messageElement = registeredMessages.get(message)!.messageElement;
    this._renderer.removeChild(messagesContainer, messageElement);
    registeredMessages.delete(message);
  }

  /** Creates the global container for all aria-describedby messages. */
  private _createMessagesContainer() {
    messagesContainer = this._renderer.createElement('div');

    this._renderer.setAttribute(messagesContainer, 'id', MESSAGES_CONTAINER_ID);
    this._renderer.setAttribute(messagesContainer, 'aria-hidden', 'true');
    this._renderer.addClass(messagesContainer, 'cdk-visually-hidden');
    this._renderer.appendChild(document.body, messagesContainer);
  }

  /** Deletes the global messages container. */
  private _deleteMessagesContainer() {
    this._renderer.removeChild(document.body, messagesContainer);
    messagesContainer = null;
  }
}
