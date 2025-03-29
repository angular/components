import ts from 'typescript';

import {DocCollection, Processor} from 'dgeni';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import {getInheritedDocsOfClass} from '../common/class-inheritance';
import {
  decorateDeprecatedDoc,
  getSelectors,
  isComponent,
  isDirective,
  isMethod,
  isNgModule,
  isProperty,
  isService,
} from '../common/decorators';
import {
  CategorizedClassDoc,
  CategorizedClassLikeDoc,
  CategorizedConstExportDoc,
  CategorizedFunctionExportDoc,
  CategorizedMethodMemberDoc,
  CategorizedPropertyMemberDoc,
  CategorizedTypeAliasExportDoc,
} from '../common/dgeni-definitions';
import {getMetadata} from '../common/directive-metadata';
import {normalizeFunctionParameters} from '../common/normalize-function-parameters';
import {isPublicDoc} from '../common/private-docs';
import {getInputBindingData, getOutputBindingData} from '../common/property-bindings';
import {sortCategorizedMethodMembers, sortCategorizedPropertyMembers} from '../common/sort-members';

/**
 * Factory function for the "Categorizer" processor. Dgeni does not support
 * dependency injection for classes. The symbol docs map is provided by the
 * TypeScript dgeni package.
 */
export function categorizer(exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>) {
  return new Categorizer(exportSymbolsToDocsMap);
}

/**
 * Processor to add properties to docs objects.
 *
 * isMethod     | Whether the doc is for a method on a class.
 * isComponent  | Whether the doc is for a @Component
 * isDirective  | Whether the doc is for a @Directive
 * isService    | Whether the doc is for an @Injectable
 * isNgModule   | Whether the doc is for an NgModule
 */
export class Categorizer implements Processor {
  $runBefore = ['docs-processed', 'entryPointGrouper'];

  constructor(
    /** Shared map that can be used to resolve docs through symbols. */
    private _exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>,
  ) {}

  $process(docs: DocCollection) {
    docs
      .filter(doc => doc.docType === 'class' || doc.docType === 'interface')
      .forEach(doc => this._decorateClassLikeDoc(doc));

    docs
      .filter(doc => doc.docType === 'function')
      .forEach(doc => this._decorateFunctionExportDoc(doc));

    docs.filter(doc => doc.docType === 'const').forEach(doc => this._decorateConstExportDoc(doc));

    docs
      .filter(doc => doc.docType === 'type-alias')
      .forEach(doc => this._decorateTypeAliasExportDoc(doc));
  }

  /**
   * Decorates all class and interface docs inside of the dgeni pipeline.
   * - Members of a class and interface document will be extracted into separate variables.
   */
  private _decorateClassLikeDoc(classLikeDoc: CategorizedClassLikeDoc) {
    // Resolve all methods and properties from the classDoc.
    classLikeDoc.methods = classLikeDoc.members
      .filter(isMethod)
      .filter(filterDuplicateMembers) as CategorizedMethodMemberDoc[];

    classLikeDoc.properties = classLikeDoc.members
      .filter(isProperty)
      .filter(filterDuplicateMembers) as CategorizedPropertyMemberDoc[];

    // Special decorations for real class documents that don't apply for interfaces.
    if (classLikeDoc.docType === 'class') {
      this._decorateClassDoc(classLikeDoc as CategorizedClassDoc);
      this._replaceMethodsWithOverload(classLikeDoc as CategorizedClassDoc);
    }

    // Call decorate hooks that can modify the method and property docs.
    classLikeDoc.methods.forEach(doc => this._decorateMethodDoc(doc));
    classLikeDoc.properties.forEach(doc => this._decoratePropertyDoc(doc));

    decorateDeprecatedDoc(classLikeDoc);

    // Sort members
    classLikeDoc.methods.sort(sortCategorizedMethodMembers);
    classLikeDoc.properties.sort(sortCategorizedPropertyMembers);
  }

  /**
   * Decorates all Dgeni class documents for a simpler use inside of the template.
   * - Identifies directives, services, NgModules or harnesses and marks them them
   *   inside of the doc.
   * - Links the Dgeni document to the Dgeni document that the current class extends from.
   */
  private _decorateClassDoc(classDoc: CategorizedClassDoc) {
    // Classes can only extend a single class. This means that there can't be multiple extend
    // clauses for the Dgeni document. To make the template syntax simpler and more readable,
    // store the extended class in a variable.
    classDoc.extendedDoc = classDoc.extendsClauses[0] ? classDoc.extendsClauses[0].doc! : undefined;
    classDoc.metadata = getMetadata(classDoc);
    classDoc.inheritedDocs = getInheritedDocsOfClass(classDoc, this._exportSymbolsToDocsMap);

    classDoc.methods.push(
      ...(classDoc.statics
        .filter(isMethod)
        .filter(filterDuplicateMembers) as CategorizedMethodMemberDoc[]),
    );

    classDoc.properties.push(
      ...(classDoc.statics
        .filter(isProperty)
        .filter(filterDuplicateMembers) as CategorizedPropertyMemberDoc[]),
    );

    // In case the extended document is not public, we don't want to print it in the
    // rendered class API doc. This causes confusion and also is not helpful as the
    // extended document is not part of the docs and cannot be viewed.
    if (classDoc.extendedDoc !== undefined && !isPublicDoc(classDoc.extendedDoc)) {
      classDoc.extendedDoc = undefined;
    }

    // Categorize the current visited classDoc into its Angular type.
    if (isComponent(classDoc) && classDoc.metadata) {
      classDoc.isComponent = true;
      classDoc.exportAs = classDoc.metadata.get('exportAs');
      classDoc.selectors = getSelectors(classDoc);
    } else if (isDirective(classDoc) && classDoc.metadata) {
      classDoc.isDirective = true;
      classDoc.exportAs = classDoc.metadata.get('exportAs');
      classDoc.selectors = getSelectors(classDoc);
    } else if (isService(classDoc)) {
      classDoc.isService = true;
    } else if (isNgModule(classDoc)) {
      classDoc.isNgModule = true;
    } else if (this._isTestHarness(classDoc)) {
      classDoc.isTestHarness = true;
    }
  }

  /**
   * Method that will be called for each method doc. The parameters for the method-docs
   * will be normalized, so that they can be easily used inside of dgeni templates.
   */
  private _decorateMethodDoc(methodDoc: CategorizedMethodMemberDoc) {
    normalizeFunctionParameters(methodDoc);
    decorateDeprecatedDoc(methodDoc);
  }

  /**
   * Method that will be called for each function export doc. The parameters for the functions
   * will be normalized, so that they can be easily used inside of Dgeni templates.
   */
  private _decorateFunctionExportDoc(functionDoc: CategorizedFunctionExportDoc) {
    normalizeFunctionParameters(functionDoc);
    decorateDeprecatedDoc(functionDoc);
  }

  /**
   * Method that will be called for each const export document. We decorate the const
   * documents with a property that states whether the constant is deprecated or not.
   */
  private _decorateConstExportDoc(doc: CategorizedConstExportDoc) {
    decorateDeprecatedDoc(doc);
  }

  /**
   * Method that will be called for each type-alias export document. We decorate the type-alias
   * documents with a property that states whether the type-alias is deprecated or not.
   */
  private _decorateTypeAliasExportDoc(doc: CategorizedTypeAliasExportDoc) {
    decorateDeprecatedDoc(doc);
  }

  /**
   * Method that will be called for each property doc. Properties that are Angular inputs or
   * outputs will be marked. Aliases for the inputs or outputs will be stored as well.
   */
  private _decoratePropertyDoc(propertyDoc: CategorizedPropertyMemberDoc) {
    decorateDeprecatedDoc(propertyDoc);

    const metadata =
      propertyDoc.containerDoc.docType === 'class'
        ? (propertyDoc.containerDoc as CategorizedClassDoc).metadata
        : null;

    const inputMetadata = metadata ? getInputBindingData(propertyDoc, metadata) : null;
    const outputMetadata = metadata ? getOutputBindingData(propertyDoc, metadata) : null;

    propertyDoc.isInput = !!inputMetadata;
    propertyDoc.inputAlias = (inputMetadata && inputMetadata.alias) || '';

    propertyDoc.isOutput = !!outputMetadata;
    propertyDoc.outputAlias = (outputMetadata && outputMetadata.alias) || '';
  }

  /**
   * Walks through every method of the specified class doc and replaces the method
   * with its referenced overload method definitions, if the method is having overload definitions.
   */
  private _replaceMethodsWithOverload(classDoc: CategorizedClassDoc) {
    const methodsToAdd: CategorizedMethodMemberDoc[] = [];

    classDoc.methods.forEach((methodDoc, index) => {
      if (methodDoc.overloads.length > 0) {
        // Add each method overload to the methods that will be shown in the docs.
        // Note that we cannot add the overloads immediately to the methods array because
        // that would cause the iteration to visit the new overloads.
        methodsToAdd.push(...(methodDoc.overloads as CategorizedMethodMemberDoc[]));

        // Remove the base method for the overloads from the documentation.
        classDoc.methods.splice(index, 1);
      }
    });

    classDoc.methods.push(...methodsToAdd);
  }

  /**
   * Whether the given class doc is considered a test harness. We naively detect
   * test harness classes by checking the inheritance chain for "ComponentHarness".
   */
  private _isTestHarness(doc: CategorizedClassDoc): boolean {
    return doc.inheritedDocs.some(d => d.name === 'ComponentHarness');
  }
}

/** Filters any duplicate classDoc members from an array */
function filterDuplicateMembers(item: MemberDoc, _index: number, array: MemberDoc[]) {
  return array.filter(memberDoc => memberDoc.name === item.name)[0] === item;
}
