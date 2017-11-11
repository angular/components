import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {NormalizedMethodMemberDoc} from './normalize-method-parameters';

export interface CategorizedClassLikeDoc extends ClassLikeExportDoc {
  methods: CategorizedMethodMemberDoc[];
  properties: CategorizedPropertyMemberDoc[];
  isDeprecated: boolean;
}

export interface CategorizedClassDoc extends ClassExportDoc, CategorizedClassLikeDoc {
  isDirective: boolean;
  isService: boolean;
  isNgModule: boolean;
  directiveExportAs?: string | null;
  directiveSelectors?: string[];
  extendedDoc: ClassLikeExportDoc | null;
}

export interface CategorizedPropertyMemberDoc extends PropertyMemberDoc {
  description: string;
  isDeprecated: boolean;
  isDirectiveInput: boolean;
  isDirectiveOutput: boolean;
  directiveInputAlias: string;
  directiveOutputAlias: string;
}

export interface CategorizedMethodMemberDoc extends NormalizedMethodMemberDoc {
  showReturns: boolean;
  isDeprecated: boolean;
}
