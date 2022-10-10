/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, Replacement, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';
import {
  convertSpeedFactorToDuration,
  createSpeedFactorConvertExpression,
} from './ripple-speed-factor';

/** Regular expression that matches [matRippleSpeedFactor]="$NUMBER" in templates. */
const speedFactorNumberRegex = /\[matRippleSpeedFactor]="(\d+(?:\.\d+)?)"/g;

/** Regular expression that matches [matRippleSpeedFactor]="$NOT_A_NUMBER" in templates. */
const speedFactorNotParseable = /\[matRippleSpeedFactor]="(?!\d+(?:\.\d+)?")(.*)"/g;

/**
 * Note that will be added whenever a speed factor expression has been converted to calculate
 * the according duration. This note should encourage people to clean up their code by switching
 * away from the speed factors to explicit durations.
 */
const removeNote = `TODO: Cleanup duration calculation.`;

/**
 * Migration that walks through every property assignment and switches the global `baseSpeedFactor`
 * ripple option to the new global animation config. Also updates every class member assignment
 * that refers to MatRipple#speedFactor.
 */
export class RippleSpeedFactorMigration extends Migration<null> {
  // Only enable this rule if the migration targets version 7 as the ripple
  // speed factor has been removed in that version.
  enabled = this.targetVersion === TargetVersion.V7;

  override visitNode(node: ts.Node) {
    if (ts.isBinaryExpression(node)) {
      return this._visitBinaryExpression(node);
    } else if (ts.isPropertyAssignment(node)) {
      return this._visitPropertyAssignment(node);
    }

    return null;
  }

  override visitTemplate(template: ResolvedResource) {
    let match: RegExpMatchArray | null;
    const replacements: Replacement[] = [];

    while ((match = speedFactorNumberRegex.exec(template.content)) !== null) {
      const newEnterDuration = convertSpeedFactorToDuration(parseFloat(match[1]));
      replacements.push({
        start: template.start + match.index!,
        length: match[0].length,
        content: `[matRippleAnimation]="{enterDuration: ${newEnterDuration}}"`,
      });
    }

    while ((match = speedFactorNotParseable.exec(template.content)) !== null) {
      const newDurationExpression = createSpeedFactorConvertExpression(match[1]);
      replacements.push({
        start: template.start + match.index!,
        length: match[0].length,
        content: `[matRippleAnimation]="{enterDuration: (${newDurationExpression})}"`,
      });
    }

    return replacements;
  }

  /** Switches binary expressions (e.g. myRipple.speedFactor = 0.5) to the new animation config. */
  private _visitBinaryExpression(expression: ts.BinaryExpression) {
    if (!ts.isPropertyAccessExpression(expression.left)) {
      return null;
    }

    // Left side expression consists of target object and property name (e.g. myInstance.val)
    const leftExpression = expression.left as ts.PropertyAccessExpression;
    const targetTypeNode = this.typeChecker.getTypeAtLocation(leftExpression.expression);

    if (!targetTypeNode.symbol) {
      return null;
    }

    const targetTypeName = targetTypeNode.symbol.getName();
    const propertyName = leftExpression.name.getText();
    const filePath = this.fileSystem.resolve(leftExpression.getSourceFile().fileName);
    const replacements: Replacement[] = [];

    if (targetTypeName === 'MatRipple' && propertyName === 'speedFactor') {
      if (ts.isNumericLiteral(expression.right)) {
        const numericValue = parseFloat(expression.right.text);
        const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

        // Replace the `speedFactor` property name with `animation`.
        replacements.push({
          start: leftExpression.name.getStart(),
          length: leftExpression.name.getWidth(),
          content: 'animation',
        });

        // Replace the value assignment with the new animation config.
        replacements.push({
          start: expression.right.getStart(),
          length: expression.right.getWidth(),
          content: `{enterDuration: ${newEnterDurationValue}}`,
        });
      } else {
        // Handle the right expression differently if the previous speed factor value can't
        // be resolved statically. In that case, we just create a TypeScript expression that
        // calculates the explicit duration based on the non-static speed factor expression.
        const newExpression = createSpeedFactorConvertExpression(expression.right.getText());

        // Replace the `speedFactor` property name with `animation`.
        replacements.push({
          start: leftExpression.name.getStart(),
          length: leftExpression.name.getWidth(),
          content: 'animation',
        });

        // Replace the value assignment with the new animation config and remove TODO.
        replacements.push({
          start: expression.right.getStart(),
          length: expression.right.getWidth(),
          content: `/** ${removeNote} */ {enterDuration: ${newExpression}}`,
        });
      }
    }

    return replacements;
  }

  /**
   * Switches the global option `baseSpeedFactor` to the new animation config. For this
   * we assume that the `baseSpeedFactor` is not used in combination with individual
   * speed factors.
   */
  private _visitPropertyAssignment(assignment: ts.PropertyAssignment) {
    // For switching the `baseSpeedFactor` global option we expect the property assignment
    // to be inside of a normal object literal. Custom ripple global options cannot be
    // witched automatically.
    if (!ts.isObjectLiteralExpression(assignment.parent)) {
      return null;
    }

    // The assignment consists of a name (key) and initializer (value).
    if (assignment.name.getText() !== 'baseSpeedFactor') {
      return null;
    }

    // We could technically lazily check for the MAT_RIPPLE_GLOBAL_OPTIONS injection token to
    // be present, but it's not right to assume that everyone sets the ripple global options
    // immediately in the provider object (e.g. it can happen that someone just imports the
    // config from a separate file).

    const {initializer, name} = assignment;
    const filePath = this.fileSystem.resolve(assignment.getSourceFile().fileName);
    const replacements: Replacement[] = [];

    if (ts.isNumericLiteral(initializer)) {
      const numericValue = parseFloat(initializer.text);
      const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

      // Replace the `baseSpeedFactor` property name with `animation`.
      replacements.push({start: name.getStart(), length: name.getWidth(), content: 'animation'});

      // Replace the value assignment initializer with the new animation config.
      replacements.push({
        start: initializer.getStart(),
        length: initializer.getWidth(),
        content: `{enterDuration: ${newEnterDurationValue}}`,
      });
    } else {
      // Handle the right expression differently if the previous speed factor value can't
      // be resolved statically. In that case, we just create a TypeScript expression that
      // calculates the explicit duration based on the non-static speed factor expression.
      const newExpression = createSpeedFactorConvertExpression(initializer.getText());

      // Replace the `baseSpeedFactor` property name with `animation`.
      replacements.push({
        start: name.getStart(),
        length: name.getWidth(),
        content: 'animation',
      });

      // Replace the value assignment with the new animation config and remove TODO.
      replacements.push({
        start: initializer.getStart(),
        length: initializer.getWidth(),
        content: `/** ${removeNote} */ {enterDuration: ${newExpression}}`,
      });
    }

    return replacements;
  }
}
