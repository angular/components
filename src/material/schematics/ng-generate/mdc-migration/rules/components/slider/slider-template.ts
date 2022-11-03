/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator} from '../../template-migrator';
import {visitElements} from '../../tree-traversal';
import {Update} from '../../../../../migration-utilities';

/** Contains a parsed binding node's standardized data. */
interface Binding {
  /** The actual compiler ast binding node. */
  node: compiler.TmplAstNode;
  /** The type of binding this node is. */
  type: BindingType;
  /** The name of the property, attribute, or event. */
  name: string;
  /** The event handler or property/attribute value. */
  value: string;
}

/** Describes the different types of bindings we care about. */
const enum BindingType {
  INPUT,
  OUTPUT,
  ATTRIBUTE,
  TWO_WAY_BINDING,
}

export class SliderTemplateMigrator extends TemplateMigrator {
  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    const updates: Update[] = [];

    visitElements(ast.nodes, (node: compiler.TmplAstElement) => {
      if (node.name === 'mat-slider') {
        const originalHtml = node.sourceSpan.start.file.content;
        const bindings = this._getBindings(node);
        const inputBindings: string[] = [];

        for (let i = 0; i < bindings.length; i++) {
          const binding = bindings[i];

          if (binding.name === 'value') {
            // Move the binding to the <input>.
            const sourceSpan = binding.node.sourceSpan;
            inputBindings.push(originalHtml.slice(sourceSpan.start.offset, sourceSpan.end.offset));
            updates.push(this._removeBinding(originalHtml, binding.node));
          }

          // TODO(wagnermaciel): Finish the remapping of other bindings.
        }

        const matSliderThumb = inputBindings.length
          ? `<input matSliderThumb ${inputBindings.join(' ')} />`
          : '<input matSliderThumb />';

        updates.push({
          offset: node.startSourceSpan.end.offset,
          updateFn: (html: string) =>
            html.slice(0, node.startSourceSpan.end.offset) +
            matSliderThumb +
            html.slice(node.startSourceSpan.end.offset),
        });
      }
    });
    return updates;
  }

  /** Returns an update that removes the given binding from the given template ast element. */
  private _removeBinding(originalHtml: string, binding: compiler.TmplAstNode): Update {
    let charIndex = binding.sourceSpan.start.offset - 1;

    // Find the first char before the binding that is not whitespace.
    while (/\s/.test(originalHtml.charAt(charIndex))) {
      charIndex--;
    }

    return {
      offset: charIndex + 1,
      updateFn: (html: string) =>
        html.slice(0, charIndex + 1) + html.slice(binding.sourceSpan.end.offset),
    };
  }

  /** Returns all of the property, attribute, event, or two-way bindings on the given node. */
  private _getBindings(node: compiler.TmplAstElement): Binding[] {
    const allInputs = this._getInputs(node);
    const allOutputs = this._getOutputs(node);
    const attributes = this._getAttributes(node);
    const twoWayBindings = this._getTwoWayBindings(allInputs, allOutputs);

    // Remove the inputs & outputs that are two-way bindings.

    const inputs = allInputs.filter(
      input => !twoWayBindings.some(binding => binding.name === input.name),
    );
    const outputs = allOutputs.filter(
      output => !twoWayBindings.some(binding => binding.name === output.name),
    );

    return inputs.concat(outputs).concat(attributes).concat(twoWayBindings);
  }

  /** Returns the two-way bindings based on the given input & output bindings. */
  private _getTwoWayBindings(inputs: Binding[], outputs: Binding[]): Binding[] {
    return inputs
      .filter(input => outputs.some(output => output.name === input.name))
      .map(input => ({...input, type: BindingType.TWO_WAY_BINDING}));
  }

  /** Returns the output bindings on the given node. */
  private _getOutputs(node: compiler.TmplAstElement): Binding[] {
    return node.outputs.map(output => ({
      node: output,
      type: BindingType.OUTPUT,
      name: node.sourceSpan.start.file.content.slice(
        output.keySpan.start.offset,
        output.keySpan.end.offset,
      ),
      value: node.sourceSpan.start.file.content.slice(
        output.handlerSpan.start.offset,
        output.handlerSpan.end.offset,
      ),
    }));
  }

  /** Returns the input bindings on the given node. */
  private _getInputs(node: compiler.TmplAstElement): Binding[] {
    return node.inputs.map(input => ({
      node: input,
      type: BindingType.INPUT,
      name: node.sourceSpan.start.file.content.slice(
        input.keySpan.start.offset,
        input.keySpan.end.offset,
      ),
      value: node.sourceSpan.start.file.content.slice(
        input.value.sourceSpan.start,
        input.value.sourceSpan.end,
      ),
    }));
  }

  /** Returns the attributes on the given node. */
  private _getAttributes(node: compiler.TmplAstElement): Binding[] {
    return node.attributes.map(attribute => ({
      node: attribute,
      type: BindingType.ATTRIBUTE,
      name: attribute.name,
      value: attribute.value,
    }));
  }
}
