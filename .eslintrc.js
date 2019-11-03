module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/class-name-casing": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            "error",
            {
                "multiline": {
                    "delimiter": "none",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
                "avoidEscape": true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            null
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "camelcase": "error",
        "capitalized-comments": "error",
        "curly": "error",
        "eol-last": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-len": [
            "error",
            {
                "ignoreRegExpLiterals": false,
                "ignoreStrings": false,
                "code": 100
            }
        ],
        "no-bitwise": "error",
        "no-caller": "error",
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "no-eval": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "no-trailing-spaces": "error",
        "no-underscore-dangle": [
            "error",
            "off"
        ],
        "no-unused-expressions": "error",
        "no-var": "error",
        "spaced-comment": "error",
        "unicorn/filename-case": "error",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "ban": [
                        true,
                        [
                            "fit"
                        ],
                        [
                            "fdescribe"
                        ],
                        [
                            "xit"
                        ],
                        [
                            "xdescribe"
                        ],
                        {
                            "name": "Object.assign",
                            "message": "Use the spread operator instead."
                        }
                    ],
                    "class-list-signatures": true,
                    "contextual-decorator": true,
                    "contextual-lifecycle": true,
                    "jsdoc-format": [
                        true,
                        "check-multiline-start"
                    ],
                    "member-naming": [
                        true,
                        {
                            "private": "^_"
                        }
                    ],
                    "missing-rollup-globals": [
                        true,
                        "./tools/package-tools/rollup-globals.ts",
                        "src/**/!(*.spec).ts",
                        "!src/+(a11y-demo|e2e-app|universal-app|dev-app)/**/*.ts",
                        "!src/**/schematics/**/*.ts"
                    ],
                    "ng-on-changes-property-access": true,
                    "no-exposed-todo": true,
                    "no-host-decorator-in-concrete": [
                        true,
                        "HostBinding",
                        "HostListener"
                    ],
                    "no-import-spacing": true,
                    "no-output-on-prefix": true,
                    "no-private-getters": true,
                    "no-undecorated-base-class-di": true,
                    "no-undecorated-class-with-ng-fields": true,
                    "no-unescaped-html-tag": true,
                    "no-unused-variable": true,
                    "one-line": [
                        true,
                        "check-catch",
                        "check-else",
                        "check-open-brace",
                        "check-whitespace"
                    ],
                    "prefer-literal": [
                        true,
                        "object"
                    ],
                    "require-breaking-change-version": true,
                    "require-license-banner": [
                        true,
                        "src/!(a11y-demo|e2e-app|material-examples|universal-app)/**/!(*.spec).ts"
                    ],
                    "rxjs-imports": true,
                    "setters-after-getters": true,
                    "template-banana-in-box": true,
                    "template-no-negated-async": true,
                    "ts-loader": true,
                    "use-lifecycle-interface": true,
                    "validate-decorators": [
                        true,
                        {
                            "Component": {
                                "!host": "\\[class\\]",
                                "!preserveWhitespaces": ".*",
                                "!styles": ".*",
                                "changeDetection": "\\.OnPush$",
                                "encapsulation": "\\.None$",
                                "moduleId": "^module\\.id$"
                            },
                            "Directive": {
                                "!host": "\\[class\\]"
                            },
                            "NgModule": "^(?!\\s*$).+"
                        },
                        "src/!(a11y-demo|e2e-app|material-examples|universal-app|dev-app)/**/!(*.spec).ts"
                    ],
                    "whitespace": [
                        true,
                        "check-branch",
                        "check-decl",
                        "check-operator",
                        "check-separator",
                        "check-type",
                        "check-preblock"
                    ]
                }
            }
        ]
    }
};
