import {Injectable, Renderer2, Optional} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the same message and the reference to the message element used for the aria-describedby.
 */
export interface RegisteredMessage {
  element: HTMLElement;
  count: number;
}

/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'md-aria-describedby-messages';

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
   * Registers the message for accessibility. If this message has not yet been
   * registered, a new element will be created in a visually hidden container with the message
   * as its content. This provides screenreaders a reference the trigger's aria-describedby.
   * If an element has already been created for this message, increase that registered message's
   * reference count.
   * @returns Identifier of the created message element.
   */
  registerMessage(message: string): string {
    if (!this._platform.isBrowser || !message) { return ''; }

    const registeredMessage = registeredMessages.get(message);
    if (registeredMessage) {
      registeredMessage.count++;
      return registeredMessage.element.id;
    }

    const messageElement = this._createMessageElement(message)!;
    registeredMessages.set(message, {element: messageElement, count: 1});

    return messageElement.id;
  }

  /**
   * Removes the message element if this is the last count of its registration.
   * Otherwise, decrease the reference count of the registered message.
   */
  unregisterMessage(message: string) {
    if (!this._platform.isBrowser || !message) { return; }

    const registeredMessage = registeredMessages.get(message)!;
    registeredMessage.count--;

    // Remove the message if this was its last unique instance.
    if (registeredMessage.count == 0) {
      this._deleteMessageElement(message);
    }

    // If the global messages container no longer has any children, remove it.
    if (messagesContainer && !messagesContainer!.childNodes.length) {
      this._renderer.removeChild(document.body, messagesContainer);
      messagesContainer = null;
    }
  }

  /**
   * Creates a new element in the visually hidden message container element with the message
   * as its content.
   */
  private _createMessageElement(message: string): HTMLElement {
    // Create a visually hidden container for the accessibility messages if one does not yet exist.
    if (!messagesContainer) { this._createMessagesContainer(); }

    const messageElement = this._renderer.createElement('div');
    this._renderer.setAttribute(messageElement, 'id', `md-aria-describedby-message-${nextId++}`);
    this._renderer.appendChild(messageElement, this._renderer.createText(message));
    this._renderer.appendChild(messagesContainer, messageElement);

    return messageElement;
  }

  /** Deletes the message element from the global messages container. */
  private _deleteMessageElement(message: string) {
    const registeredMessage = registeredMessages.get(message)!;
    this._renderer.removeChild(messagesContainer, registeredMessage.element);
    registeredMessages.delete(message);
  }

  /** Creates the global container for all aria-describedby messages. */
  private _createMessagesContainer() {
    messagesContainer = this._renderer.createElement('div');
    this._renderer.setAttribute(messagesContainer, 'id', MESSAGES_CONTAINER_ID);
    this._renderer.addClass(messagesContainer, 'cdk-visually-hidden');
    this._renderer.appendChild(document.body, messagesContainer);
  }
}
