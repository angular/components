import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/**
 * Interface used to register tooltip a11y message elements, with a count of how many tooltips have
 * the message and the reference to the a11y message element used for the aria-describedby.
 */
export interface RegisteredA11yMessage {
  element: HTMLElement;
  count: number;
}

/** ID used for the body container where all a11y messages are appended. */
export const A11Y_MESSAGES_CONTAINER_ID = 'md-tooltip-a11y-messages';

/** Global incremental identifier for each registered a11y message. */
let latestA11yMessageId = 0;

/** Global map of all registered a11y message elements that have been placed into the document. */
const a11yMessages = new Map<string, RegisteredA11yMessage>();

@Injectable()
export class AriaDescriber {
  constructor(private _platform: Platform) { }

  /**
   * Registers the tooltip message for accessibility. If this message has not yet been
   * registered, a new element will be created in a visually hidden container with the message
   * as its content. This provides screenreaders a reference the tooltip trigger's aria-describedby.
   * If an element has already been created for this message, increase that registered message's
   * reference count.
   */
  registerMessage(message: string): RegisteredA11yMessage {
    const a11yMessage = a11yMessages.get(message);
    if (a11yMessage) {
      a11yMessage.count++;
    } else {
      this._createA11yMessageElement(message);
    }

    return a11yMessages.get(message)!;
  }

  /**
   * Removes the a11y tooltip message element if no other tooltips are registered with the same
   * message. Otherwise, decrease the reference count of the registered a11y tooltip message.
   */
  unregisterMessage(message: string) {
    if (!this._platform.isBrowser || !message) { return; }

    const a11yMessageElement = a11yMessages.get(message)!;
    a11yMessageElement.count--;

    // Remove the a11y message if this was its last unique instance.
    if (a11yMessageElement.count == 0) {
      this._deleteA11yMessageElement(message);
    }

    // If the global messages container no longer has any children, remove it.
    if (!this._getA11yMessagesContainer()!.childNodes.length) {
      document.body.removeChild(this._getA11yMessagesContainer()!);
    }
  }

  /**
   * Creates a new element in the visually hidden a11y message container element with the message
   * as its content.
   */
  private _createA11yMessageElement(message: string) {
    if (!this._platform.isBrowser) { return; }

    // Create a visually hidden container for the accessibility messages if one does not yet exist.
    if (!this._getA11yMessagesContainer()) {
      this._createA11yMessagesContainer();
    }

    const messageElement = document.createElement('div');
    messageElement.id = `md-tooltip-message-${latestA11yMessageId++}`;
    messageElement.textContent = message;

    this._getA11yMessagesContainer()!.appendChild(messageElement);
    a11yMessages.set(message, {element: messageElement, count: 1});

    return messageElement;
  }

  /** Deletes the a11y message element from the global a11y tooltip messages container. */
  private _deleteA11yMessageElement(message: string) {
    if (!this._platform.isBrowser) { return; }

    const a11yMessage = a11yMessages.get(message)!;
    this._getA11yMessagesContainer()!.removeChild(a11yMessage.element);
    a11yMessages.delete(message);
  }

  /** Creates the global container for all tooltip a11y messages. */
  private _createA11yMessagesContainer() {
    const a11yMessagesContainer = document.createElement('div');
    a11yMessagesContainer.id = A11Y_MESSAGES_CONTAINER_ID;
    a11yMessagesContainer.className = 'cdk-visually-hidden';
    document.body.appendChild(a11yMessagesContainer);
  }

  /** Returns the global container for tooltip a11y messages. */
  private _getA11yMessagesContainer() {
    return document.getElementById(A11Y_MESSAGES_CONTAINER_ID);
  }
}
