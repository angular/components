<a name="19.0.2"></a>
# 19.0.2 "plastic-rhino" (2024-12-04)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [460f971b27](https://github.com/angular/components/commit/460f971b27239d0102061a9b976e86af513065a7) | fix | **accordion:** improve accessibility in example code ([#30087](https://github.com/angular/components/pull/30087)) |
| [6306a12c12](https://github.com/angular/components/commit/6306a12c12ee0c255e20dfb9be78076f880120bf) | fix | **menu:** disable flexible dimensions ([#30086](https://github.com/angular/components/pull/30086)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [0ed9869529](https://github.com/angular/components/commit/0ed9869529b4c7a2d008f8125f252d49e913228c) | fix | **button-toggle:** unable to tab into ngModel-based group on first render ([#30103](https://github.com/angular/components/pull/30103)) |
| [72ff6fcce3](https://github.com/angular/components/commit/72ff6fcce323c1f44b57b3fa2dec92a13a5dbcd3) | fix | **core:** optgroup label color not inferred correctly ([#30085](https://github.com/angular/components/pull/30085)) |
| [c395585446](https://github.com/angular/components/commit/c3955854469db7bc07dbfc511391bbcd00ae7666) | fix | **schematics:** avoid parsing stylesheets that don't include Material |
| [5b3350a60e](https://github.com/angular/components/commit/5b3350a60eb9c0dfcf483bacc3c782c1308f180e) | fix | **schematics:** error if stylesheet contains syntax errors |
| [1235ad28bc](https://github.com/angular/components/commit/1235ad28bcf7f950510f6c0e548268e125298f62) | fix | **sort:** simplify animations ([#30057](https://github.com/angular/components/pull/30057)) |
| [5b165067e8](https://github.com/angular/components/commit/5b165067e8f12587db4fa15f30069651164c3e4e) | fix | **tabs:** ink bar not showing when same tab is re-selected ([#30121](https://github.com/angular/components/pull/30121)) |
### youtube-player
| Commit | Type | Description |
| -- | -- | -- |
| [1d3905a208](https://github.com/angular/components/commit/1d3905a2086954cbeec2b17aa8b11378d48311f3) | fix | update to latest typings ([#30126](https://github.com/angular/components/pull/30126)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.1"></a>
# 19.0.1 "mercury-mailbox" (2024-11-27)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [2d7e078bb](https://github.com/angular/components/commit/2d7e078bb46d665f21a6ef3ff1b76fec336862bc) | fix | **button-toggle:** animate checkbox ([#30025](https://github.com/angular/components/pull/30025)) |
| [edac40645](https://github.com/angular/components/commit/edac40645f5130a9b85eaefa2479792a93d62396) | fix | **chips:** emit state changes when chip grid is disabled ([#30033](https://github.com/angular/components/pull/30033)) |
| [18f7f4bb9](https://github.com/angular/components/commit/18f7f4bb9e3b9cae8563f3134aadede818140e9d) | fix | **datepicker:** adds comparison ids and aria-describedby spans ([#30040](https://github.com/angular/components/pull/30040)) |
| [375435497](https://github.com/angular/components/commit/375435497fa42446ea51d11f72c32853fb337933) | fix | **slider:** update documentation ([#30029](https://github.com/angular/components/pull/30029)) |
| [a31201475](https://github.com/angular/components/commit/a3120147523da86bc0e8d9531344d3c531c4795b) | fix | **timepicker:** make disabled input public ([#30063](https://github.com/angular/components/pull/30063)) |
### docs
| Commit | Type | Description |
| -- | -- | -- |
| [f9d9d2c81](https://github.com/angular/components/commit/f9d9d2c8115da469c234768c220205feb2a58eb1) | fix | update errorState example to cover handle missing state ([#30059](https://github.com/angular/components/pull/30059)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [59b7f436a](https://github.com/angular/components/commit/59b7f436acc5c4b2e732ec09ac44e031e8b422bf) | fix | use cross-compatible type for setTimeout ([#30073](https://github.com/angular/components/pull/30073)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.0"></a>
# 19.0.0 "hafnium-hippo" (2024-11-19)
## Breaking Changes
### cdk
- * Since `cdk.high-contrast` targets a media query instead of a class, the specificity of the styles it emits is lower than before.
- * The overlay stays are now loaded slightly later than before which can change their specificity. You may have to update any overlay style overrides.
- * Virtual scrolling lists now have proper type checking which can reveal some previously-hidden compilation errors.

  * fix(cdk/scrolling): adds ngTemplateContextGuard

  implements ngTemplateContextGuard for CdkVirtualForOf directive
### material
- * The ripples styles are now loaded slightly later than before which can change their specificity. You may have to update any ripple style overrides.
- * `mixinColor` and `CanColor` have been removed. Use a host binding instead.
  * `mixinDisableRipple` and `CanDisableRipple` have been removed. Use input transforms instead.
  * `mixinDisabled` and `CanDisable` have been removed. Use input transforms instead.
  * `mixinInitialized` and `HasInitialized` have been removed. Use a `Subject` that emits in `ngOnInit` instead.
  * `mixinTabIndex` and `HasTabIndex` have been removed. Use input transforms instead.
### google-maps
- * The new @googlemaps/markerclusterer API should be imported instead of the old one. Read more at: https://github.com/googlemaps/js-markerclusterer
  * The `MapMarkerClusterer` class has been renamed to `DeprecatedMapMarkerClusterer`.
  * The `map-marker-clusterer` selector has been changed to `deprecated-map-marker-clusterer`.
### multiple
- * In order for Material to be compatible with [recent changes in Sass](https://sass-lang.com/documentation/breaking-changes/mixed-decls/) and upcoming changes in the CSS standard, tokens are now emitted in-place, rather the being hoisted to the top of the selector. As a result, some token overrides might not apply anymore. This is relevant primarily for the cases like `@include mat.button-theme($theme); --mat-button-color: red;`. It can be resolved by wrapping the overrides with `& {}`, for example `@include mat.button-theme($theme); & { --mat-button-color: red; }`.
- * `MatButton.ripple` is no longer available.
  * `MatCheckbox.ripple` is no longer available.
  * `MatChip.ripple` is no longer available.
### material-date-fns-adapter
| Commit | Type | Description |
| -- | -- | -- |
| [234e5e0e8](https://github.com/angular/components/commit/234e5e0e8b7001671b459491bc048c379e29fc1d) | feat | add support for date-fns 4 ([#29744](https://github.com/angular/components/pull/29744)) |
### youtube-player
| Commit | Type | Description |
| -- | -- | -- |
| [09da06b42](https://github.com/angular/components/commit/09da06b42e2aad668bbdeb9adecdad401b0d8df6) | fix | ready event not emitting |
| [288598750](https://github.com/angular/components/commit/2885987500f9005fbdf981c700b516096896868b) | fix | startSeconds not applied when using placeholder |
### google-maps
| Commit | Type | Description |
| -- | -- | -- |
| [1bd976c6a](https://github.com/angular/components/commit/1bd976c6a7b4493e9dc741f6fe25fde455adfbcf) | feat | Add support for some mouse events [#29741](https://github.com/angular/components/pull/29741) ([#29747](https://github.com/angular/components/pull/29747)) |
| [a05475e76](https://github.com/angular/components/commit/a05475e769d6a64e10cdcebca83f1906b322f9a9) | feat | deprecate marker cluster component |
| [c70aae15b](https://github.com/angular/components/commit/c70aae15b095f5d7005b491270866f6647732a26) | feat | implement new marker clusterer |
| [b9deeee85](https://github.com/angular/components/commit/b9deeee85b06fa24812f36d8290390b6f058d131) | fix | add schematic to switch to the new clusterer name |
| [a6709497f](https://github.com/angular/components/commit/a6709497fc6e5eca110db5374f7d6ca4b2ca5a58) | fix | expose all clusterer types ([#29905](https://github.com/angular/components/pull/29905)) |
| [74c2a081f](https://github.com/angular/components/commit/74c2a081f9c4c2221cab62efee3db81789bf6efa) | fix | resolve CLI errors in ng update schematic ([#29947](https://github.com/angular/components/pull/29947)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [9122335b2](https://github.com/angular/components/commit/9122335b25b28a5532159ab87c36aab3be9c3716) | feat | **checkbox:** add new aria properties to MatCheckbox ([#29457](https://github.com/angular/components/pull/29457)) |
| [64ed7ca71](https://github.com/angular/components/commit/64ed7ca7157b519703d152bb86a84a233f310f71) | feat | **core:** add experimental theme demo ([#29636](https://github.com/angular/components/pull/29636)) |
| [a58e6f671](https://github.com/angular/components/commit/a58e6f6711af48f7106ed675b4b996c41899a0be) | feat | **core:** add theme-overrides mixin ([#29858](https://github.com/angular/components/pull/29858)) |
| [d206225c5](https://github.com/angular/components/commit/d206225c58d071e6cb6b680ef11d1c7bab7a73cc) | feat | **core:** create focus-indicator structural styles loader ([#29763](https://github.com/angular/components/pull/29763)) |
| [b519b4785](https://github.com/angular/components/commit/b519b4785b1da26becdb88e3810d606b9bddedfc) | feat | **core:** default to color-scheme theme type ([#29907](https://github.com/angular/components/pull/29907)) |
| [ea0d1ba7b](https://github.com/angular/components/commit/ea0d1ba7b776e021ecfa27b80c921a22b98e3c40) | feat | **core:** deprecate the core mixin ([#29906](https://github.com/angular/components/pull/29906)) |
| [486990912](https://github.com/angular/components/commit/4869909123c37a4910f5fde3f70d59cda4b44816) | feat | **core:** rename theme mixin ([#29857](https://github.com/angular/components/pull/29857)) |
| [4b49d7354](https://github.com/angular/components/commit/4b49d73542a4b10c8d5bd67a7258bfdd44a8e329) | feat | **core:** switch system prefix from sys to mat-sys ([#29908](https://github.com/angular/components/pull/29908)) |
| [1abb484aa](https://github.com/angular/components/commit/1abb484aa72177a748eecdf9b850cc1c07d1a42b) | feat | **input:** add the ability to interact with disabled inputs ([#29574](https://github.com/angular/components/pull/29574)) |
| [4adc3725d](https://github.com/angular/components/commit/4adc3725dd08ef3cf3868f9c752e16c8c1492466) | feat | **schematics:** create v19 core removal schematic ([#29768](https://github.com/angular/components/pull/29768)) |
| [9c3af284f](https://github.com/angular/components/commit/9c3af284f89c9a10af66e0ded6f7805bab207a91) | feat | **schematics:** Switch custom theme schematic to use theme mixin instead of define-theme and add high contrast override mixins ([#29642](https://github.com/angular/components/pull/29642)) |
| [3fc1f9a1b](https://github.com/angular/components/commit/3fc1f9a1b026b9cd0ec666bc623169d1ba5a9532) | feat | **schematics:** Update custom theme schematic to work with light-dark and use theme-overrides mixin ([#29911](https://github.com/angular/components/pull/29911)) |
| [ff3d342fd](https://github.com/angular/components/commit/ff3d342fd4ab91d0dd24147bc747c5a0ba8f1aaf) | feat | **tabs:** add `alignTabs` in `MatTabsConfig` ([#29779](https://github.com/angular/components/pull/29779)) |
| [371446a7c](https://github.com/angular/components/commit/371446a7cfb5176e02fe796b4d39941db82c22c2) | feat | **theming:** Disambiguate token names in theme overrides ([#29859](https://github.com/angular/components/pull/29859)) |
| [9546fe77e](https://github.com/angular/components/commit/9546fe77ef7322276bddf25ed826b2ab73e5ee20) | feat | **timepicker:** add test harnesses |
| [2646e0885](https://github.com/angular/components/commit/2646e088510f00ca2ae885d42acae9c7fcd8656e) | feat | **timepicker:** add timepicker component |
| [de6c20686](https://github.com/angular/components/commit/de6c20686c441ff39b872b69c725c3c46b1f3a93) | fix | **bottom-sheet:** add `height` `minHeight` `maxHeight` to config ([#29794](https://github.com/angular/components/pull/29794)) |
| [fcb76d3ed](https://github.com/angular/components/commit/fcb76d3ed1ed4f6d5634496f47473efeda3bd1aa) | fix | **core:** add missing system variables ([#29624](https://github.com/angular/components/pull/29624)) |
| [5ad133d07](https://github.com/angular/components/commit/5ad133d07341fa8647e81277e7f1b9f54b15059a) | fix | **core:** allow optgroup overrides through core-overrides ([#29897](https://github.com/angular/components/pull/29897)) |
| [0fb4247ce](https://github.com/angular/components/commit/0fb4247ce834c475556a17e116e20f1ec0fd5a5a) | fix | **core:** avoid browser inconsistencies when parsing time |
| [855ed4948](https://github.com/angular/components/commit/855ed49482b1e215f43e1e9b96f1b28eded94640) | fix | **core:** avoid having to manually load ripple styles |
| [d0d59b784](https://github.com/angular/components/commit/d0d59b784abdde79bebaf9cff6d316c952228fa7) | fix | **core:** change ng-add to use mat.theme ([#29990](https://github.com/angular/components/pull/29990)) |
| [a8e40ec34](https://github.com/angular/components/commit/a8e40ec341103a4f3fa84bd446067dd37cbf6d50) | fix | **core:** correctly identify color input ([#29909](https://github.com/angular/components/pull/29909)) |
| [edce90652](https://github.com/angular/components/commit/edce90652ade6715b4404db284f684b1b511fae4) | fix | **core:** delete deprecated APIs ([#29651](https://github.com/angular/components/pull/29651)) |
| [54875a325](https://github.com/angular/components/commit/54875a3258a89a5326d7e224b6550c96e5801cd5) | fix | **core:** drop sanity checks ([#29688](https://github.com/angular/components/pull/29688)) |
| [ef14c2869](https://github.com/angular/components/commit/ef14c286986f9451addeada26ab7b51402aa143f) | fix | **core:** option showing double selected indicator in high contrast mode |
| [5403b4b07](https://github.com/angular/components/commit/5403b4b074d0a694bdba5b145f43ce61b1145ad1) | fix | **core:** remove unused motion system vars ([#29920](https://github.com/angular/components/pull/29920)) |
| [613cf5406](https://github.com/angular/components/commit/613cf54063138201a9398979cd363ee1ace7ea66) | fix | **core:** rename sys vars from mat-app to mat-sys ([#29879](https://github.com/angular/components/pull/29879)) |
| [d0e178b75](https://github.com/angular/components/commit/d0e178b75eb8e8e4d158ebff146cfb2ecadef686) | fix | **core:** stop manually instantiating MatRipple directive ([#29630](https://github.com/angular/components/pull/29630)) |
| [d55ec612c](https://github.com/angular/components/commit/d55ec612cc66b42971c9da2677bc6e54017dd271) | fix | **core:** update prebuilt themes to use mat.theme ([#29989](https://github.com/angular/components/pull/29989)) |
| [7cf8c6c46](https://github.com/angular/components/commit/7cf8c6c464732af4283c5e3c3c724dd90acc4136) | fix | **datepicker:** calendar font tokens not being picked up ([#29610](https://github.com/angular/components/pull/29610)) |
| [5ba97925b](https://github.com/angular/components/commit/5ba97925b64a23cdaabfea514dda964c79f4a5f1) | fix | **form-field:** avoid touching the DOM on each state change |
| [a2cd04902](https://github.com/angular/components/commit/a2cd0490260e99ec0a9a23d0837177f99fc81425) | fix | **form-field:** incorrect form field border radius with system-level themes ([#29966](https://github.com/angular/components/pull/29966)) |
| [5345a875f](https://github.com/angular/components/commit/5345a875f68526191493e8220d4ed91c72d0e5eb) | fix | **input:** preserve aria-describedby set externally |
| [9dcb95a72](https://github.com/angular/components/commit/9dcb95a722adc2cf151fc559a3eaf76195aca3f2) | fix | **list:** remove unnecessary high contrast styles |
| [dbcb921d5](https://github.com/angular/components/commit/dbcb921d54608adc95dc124635d2973312928687) | fix | **menu:** handle keyboard events through dispatcher ([#29997](https://github.com/angular/components/pull/29997)) |
| [de5e57ad1](https://github.com/angular/components/commit/de5e57ad1d9a76922091ca3adbab35bb9843b5fd) | fix | **menu:** use static elevation ([#29968](https://github.com/angular/components/pull/29968)) |
| [482009bac](https://github.com/angular/components/commit/482009bac173bd4453d20dfec283e3cab23d2af0) | fix | **schematics:** add explicit system variable prefix schematic ([#29980](https://github.com/angular/components/pull/29980)) |
| [75631fb0b](https://github.com/angular/components/commit/75631fb0b305891ea22e422f8bd9d9d991c1d6ef) | fix | **sidenav:** prevent the content from jumping when hydrated ([#29991](https://github.com/angular/components/pull/29991)) |
| [14e9ec7cc](https://github.com/angular/components/commit/14e9ec7ccb0956f54604ee9f19c6dbee6b496fcd) | fix | **timepicker:** always re-focus input |
| [1eda48604](https://github.com/angular/components/commit/1eda4860400fbb08c76b7760bb0eba3234f0c707) | fix | **timepicker:** hide toggle icon from assistive technology |
| [490bcfe38](https://github.com/angular/components/commit/490bcfe38c1f640beefdf537d2af46467f07a4c7) | fix | **timepicker:** more flexible interval parsing |
| [fb6e20290](https://github.com/angular/components/commit/fb6e20290ba6842c5190217de55d13044169eebf) | fix | **timepicker:** text field in parse error not up to date |
| [9b5ee9d55](https://github.com/angular/components/commit/9b5ee9d551f09f606cb0e92f6288cf3edd76a1da) | fix | **timepicker:** value considered as invalid by default |
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [f4a02adb7](https://github.com/angular/components/commit/f4a02adb779968ab1e696aa93dc69b62e7a18929) | feat | **a11y:** use native media query for high contrast detection ([#29678](https://github.com/angular/components/pull/29678)) |
| [9b4085c6e](https://github.com/angular/components/commit/9b4085c6e3eee78556000c0f60ef2c51c0668ed9) | feat | **private:** create cdk-visually-hidden style loader ([#29757](https://github.com/angular/components/pull/29757)) |
| [df21d2b09](https://github.com/angular/components/commit/df21d2b0915ee54fbf04b93ccba512a9161f5008) | fix | **overlay:** avoid having to manually load structural styles |
| [560878a23](https://github.com/angular/components/commit/560878a231373dca51ecac07f913503ee3e860aa) | fix | **overlay:** load structural styles in a cascade layer ([#29725](https://github.com/angular/components/pull/29725)) |
| [873eb01e0](https://github.com/angular/components/commit/873eb01e018018f19434a4187a6b2a871272d09a) | fix | **portal:** remove ComponentFactoryResolver usages ([#27427](https://github.com/angular/components/pull/27427)) |
| [5439460d1](https://github.com/angular/components/commit/5439460d1fe166f8ec34ab7d48f05e0dd7f6a946) | fix | **scrolling:** adds ngTemplateContextGuard ([#27276](https://github.com/angular/components/pull/27276)) |
| [ad18e6d74](https://github.com/angular/components/commit/ad18e6d74e57e4980a411f0ac9d0b502d5fc577f) | fix | **text-field:** avoid having to manually load text field styles |
| [bd84c2a67](https://github.com/angular/components/commit/bd84c2a67476b688a0c775de8566a4ff4b3b2ce0) | fix | **tree:** fix issue where `isExpanded` wouldn't be set if placed before `isExpandable` ([#29565](https://github.com/angular/components/pull/29565)) |
| [3b4ade5a0](https://github.com/angular/components/commit/3b4ade5a0b0df26cb72a9bb81742e1ea5d86a46a) | fix | **tree:** only handle keyboard events directly from the node ([#29861](https://github.com/angular/components/pull/29861)) |
| [f6066c23f](https://github.com/angular/components/commit/f6066c23feee5a23d870104860f1e18bb9f3db83) | fix | **tree:** warn if mixed node types are used within the same tree |
### mat
| Commit | Type | Description |
| -- | -- | -- |
| [8f0369a27](https://github.com/angular/components/commit/8f0369a27faa7cd6758d78a0a4e1c40811747e49) | fix | **paginator:** fix focus issues with paginator buttons ([#29379](https://github.com/angular/components/pull/29379)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [01711b180](https://github.com/angular/components/commit/01711b180404ad029bef54e81bdc90fb158dc506) | fix | account for mixed declarations in latest Sass version ([#29596](https://github.com/angular/components/pull/29596)) |
| [cb1450fc7](https://github.com/angular/components/commit/cb1450fc76998426111e150a983deb31ecbe42ce) | fix | change fallbacks to use m3 ([#29528](https://github.com/angular/components/pull/29528)) |
| [a9da72ed1](https://github.com/angular/components/commit/a9da72ed1551601b22b1a509f2e50227ac23f432) | fix | consolidate strong focus indicators ([#29623](https://github.com/angular/components/pull/29623)) |
| [be342289c](https://github.com/angular/components/commit/be342289c2cc720af31edf1ce98eee08e2bf9235) | fix | remove final references to ComponentFactoryResolver ([#29832](https://github.com/angular/components/pull/29832)) |
| [d1d53f51a](https://github.com/angular/components/commit/d1d53f51ad9c565275c4916cf8e107dd994b7fc3) | fix | remove usages of Sass globals ([#29972](https://github.com/angular/components/pull/29972)) |
| [b3a9062ed](https://github.com/angular/components/commit/b3a9062edf8863250ddd462e5abe009fbc46243b) | fix | ripples not showing up in some cases ([#29672](https://github.com/angular/components/pull/29672)) |
| [485bd9923](https://github.com/angular/components/commit/485bd9923b732390fbc3533f94815da97bd34c13) | fix | stop exposing internal ripple implementation ([#29622](https://github.com/angular/components/pull/29622)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.10"></a>
# 18.2.10 "plastic-monkey" (2024-10-23)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [501faa9a54](https://github.com/angular/components/commit/501faa9a547c043e8abef5cb75acca930f31fa2e) | fix | **chips:** emitting end event multiple times when holding down key ([#29894](https://github.com/angular/components/pull/29894)) |
| [4a0397a1c7](https://github.com/angular/components/commit/4a0397a1c7527b1e56a1aedebe5dfc262327e134) | fix | **tabs:** remove IE animation workaround ([#29899](https://github.com/angular/components/pull/29899)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.9"></a>
# 18.2.9 "curite-castle" (2024-10-17)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [80bfac26b](https://github.com/angular/components/commit/80bfac26b17a1e54779aaf806a2ed7a718104d8f) | fix | **badge:** content incorrectly truncated in M3 ([#29854](https://github.com/angular/components/pull/29854)) |
| [2d7519178](https://github.com/angular/components/commit/2d7519178573c62022d2d65efa08a43b50a47e88) | fix | **card:** elevated card container color ([#29835](https://github.com/angular/components/pull/29835)) |
| [6ce574731](https://github.com/angular/components/commit/6ce574731f14b5c675f5ddeadd2a93f4f105c825) | fix | **dialog:** updates dialog max-height in landscape ([#29853](https://github.com/angular/components/pull/29853)) |
| [ddb55e2c2](https://github.com/angular/components/commit/ddb55e2c2bcb65048d57c692a830ddc1ded728fb) | fix | **form-field:** account in `cols` attribute on textarea ([#29836](https://github.com/angular/components/pull/29836)) |
| [afc6b9db1](https://github.com/angular/components/commit/afc6b9db1aa784408e900f82ae7e04250a34f472) | fix | **radio:** use tokens for focused border color ([#29716](https://github.com/angular/components/pull/29716)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.8"></a>
# 18.2.8 "actinium-angle" (2024-10-09)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [fa43a2456](https://github.com/angular/components/commit/fa43a245668201f7a54fa76c320825c5234a7c04) | fix | **stepper:** remove mock of forms type |
| [5bed0943a](https://github.com/angular/components/commit/5bed0943a6f3a0913242b7b998e473da875303e6) | fix | **stepper:** reset submitted state when resetting stepper |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [104b5932c](https://github.com/angular/components/commit/104b5932c6aba2f06172f9156f68bc4390a11215) | feat | **core:** expose styling information to the docs site |
| [7ebfbeb6c](https://github.com/angular/components/commit/7ebfbeb6c9ecf08f6fd3926113c43ed91be5da6d) | fix | **schematics:** treat lower dependency builder as default builder ([#29833](https://github.com/angular/components/pull/29833)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.7"></a>
# 18.2.7 "lava-labyrinth" (2024-10-03)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [3e1faec2aa](https://github.com/angular/components/commit/3e1faec2aa70938259d409b3696ca3f83cbb04df) | fix | **drag-drop:** positioning thrown off with align-self ([#29813](https://github.com/angular/components/pull/29813)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [9280ad3948](https://github.com/angular/components/commit/9280ad3948a52e737bc23abc94ed098ed311afd9) | fix | **chips:** chip grid not re-focusing first item |
| [7a5c1dfb46](https://github.com/angular/components/commit/7a5c1dfb46b12c6ba99b7448fc458342d8ef6629) | fix | **chips:** chip set overwriting disabled state ([#29795](https://github.com/angular/components/pull/29795)) |
| [0fabf52036](https://github.com/angular/components/commit/0fabf52036a6e0a7ea20022a18d7247d669074dc) | fix | **chips:** focus escape not working consistently |
| [da55ad02bc](https://github.com/angular/components/commit/da55ad02bc913cdeaee7a53afbf470bd283a52db) | fix | **core:** infer first day of week in native date adapter ([#29802](https://github.com/angular/components/pull/29802)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.6"></a>
# 18.2.6 "emerald-egg" (2024-09-25)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [d8c2b420c9](https://github.com/angular/components/commit/d8c2b420c939ab65da926d1fc99a64e08f6e494d) | fix | **datepicker:** set explicit line height on calendar ([#29770](https://github.com/angular/components/pull/29770)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.5"></a>
# 18.2.5 "bismuth-badge" (2024-09-20)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [1ea55b6e8](https://github.com/angular/components/commit/1ea55b6e80127046a9bc597f4d495374ad4d0524) | fix | **drag-drop:** account for scale when setting free drag position ([#29739](https://github.com/angular/components/pull/29739)) |
| [aae74b031](https://github.com/angular/components/commit/aae74b031b23520440b6556ac89391303cc8894b) | fix | **listbox:** scroll active option into view when using aria-activedescendant ([#29722](https://github.com/angular/components/pull/29722)) |
| [7db4b5f4c](https://github.com/angular/components/commit/7db4b5f4c19ed7e0e797dfc31a853713932d875b) | fix | **tree:** resolve maximum call stack error ([#29754](https://github.com/angular/components/pull/29754)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [f9e18109e](https://github.com/angular/components/commit/f9e18109e813d9f735a324ae9fdf27cb6ddc08bd) | fix | **chips:** increase chip remove touch target size ([#29452](https://github.com/angular/components/pull/29452)) |
| [2cf2f5321](https://github.com/angular/components/commit/2cf2f5321e724bced1b9c43eeca2503a7fe2fdc4) | fix | **datepicker:** replace labels not pointing to anything ([#29755](https://github.com/angular/components/pull/29755)) |
| [7ab65e4fb](https://github.com/angular/components/commit/7ab65e4fb99e063cce7d0aa29701e811d10771c0) | fix | **select:** remove incompatible aria-autocomplete attribute ([#29645](https://github.com/angular/components/pull/29645)) |
| [06818a7ed](https://github.com/angular/components/commit/06818a7ed8777d6fe5b9eca7802977691385ab67) | fix | **slider:** log proper error when slider isn't configured correctly ([#29745](https://github.com/angular/components/pull/29745)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.4"></a>
# 18.2.4 "aramid-angle" (2024-09-12)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [7cc0d3a6d](https://github.com/angular/components/commit/7cc0d3a6ddff1840ce34f1b132656fa373bc144d) | fix | **overlay:** avoid leaking memory through afterNextRender ([#29709](https://github.com/angular/components/pull/29709)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [651b448e8](https://github.com/angular/components/commit/651b448e819333e64ee706d3cf093b9447ba0145) | fix | **badge:** change legacy container size default ([#29713](https://github.com/angular/components/pull/29713)) |
| [0e6dee30a](https://github.com/angular/components/commit/0e6dee30a2e77d9b0fa9ff9e55daa8641c030521) | fix | **form-field:** Don't allow label to grow larger than input ([#29673](https://github.com/angular/components/pull/29673)) |
| [57028df23](https://github.com/angular/components/commit/57028df2313a98ef40d294893b396e74d3488983) | fix | **select:** Update checkbox color to match the selected label text color ([#29684](https://github.com/angular/components/pull/29684)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.3"></a>
# 18.2.3 "parchment-deluge" (2024-09-04)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [0f07b25d12](https://github.com/angular/components/commit/0f07b25d12fae6495080c614dd453bc9e193d7c4) | fix | **badge:** resolve memory leak ([#29676](https://github.com/angular/components/pull/29676)) |
| [fe3f30ff2f](https://github.com/angular/components/commit/fe3f30ff2f5110996681bc02ec3b732591846f03) | fix | **core:** Allow system variables to be formatted for opacity ([#29665](https://github.com/angular/components/pull/29665)) |
| [5d93395442](https://github.com/angular/components/commit/5d93395442153fd04ad1f427053be9913c73f487) | fix | **core:** Fix incorrect color role mappings ([#29655](https://github.com/angular/components/pull/29655)) |
| [4a79052ae0](https://github.com/angular/components/commit/4a79052ae077c632afd1f8fd001a96bb3406b0c0) | fix | **tooltip:** remove old IE workaround ([#29674](https://github.com/angular/components/pull/29674)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.2"></a>
# 18.2.2 "steel-sword" (2024-08-28)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [39d3d01340](https://github.com/angular/components/commit/39d3d0134050830294f7185a4ac9849f043e480c) | fix | **drag-drop:** error if ngDevMode is undefined ([#29634](https://github.com/angular/components/pull/29634)) |
| [b1c5ed7260](https://github.com/angular/components/commit/b1c5ed7260a1acad451899573c4d4a3fe6398a82) | fix | **tree:** avoid breaking change in constructor ([#29648](https://github.com/angular/components/pull/29648)) |
| [ff95692125](https://github.com/angular/components/commit/ff95692125ff79fccaff8fab85479dd7c5633675) | fix | **tree:** capturing focus on load ([#29641](https://github.com/angular/components/pull/29641)) |
| [f888b3d95a](https://github.com/angular/components/commit/f888b3d95ab94ceb779c05860c6e65d82a11eff8) | fix | **tree:** fix issue where `isExpanded` wouldn't be set if placed before `isExpandable` ([#29565](https://github.com/angular/components/pull/29565)) ([#29647](https://github.com/angular/components/pull/29647)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [3ce4e9fc2a](https://github.com/angular/components/commit/3ce4e9fc2adae1761531da18c3afe046fb68c5b0) | fix | **schematics:** Add the missing neutral tones for the M3 color palettes ([#29644](https://github.com/angular/components/pull/29644)) |
| [f93d0f4095](https://github.com/angular/components/commit/f93d0f40957e779ed8888433dddd658b1ed4018e) | perf | **tooltip:** Avoid unneeded calls to clearTimeout ([#29643](https://github.com/angular/components/pull/29643)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.1"></a>
# 18.2.1 "plastic-panda" (2024-08-22)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [3a2d13e2e4](https://github.com/angular/components/commit/3a2d13e2e4740acb32a09ed008dfc3f927b25423) | fix | **drag-drop:** preview positioned incorrectly when RTL is set on the body ([#29606](https://github.com/angular/components/pull/29606)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [bad94fda58](https://github.com/angular/components/commit/bad94fda58c38940366e13201bca0dcb92f4ded2) | fix | **datepicker:** calendar font tokens not being picked up ([#29610](https://github.com/angular/components/pull/29610)) ([#29615](https://github.com/angular/components/pull/29615)) |
| [c4c62b8549](https://github.com/angular/components/commit/c4c62b854915a1195d723d6c47eef40c4c28805a) | fix | **icon:** update error message for missing HttpClient ([#29589](https://github.com/angular/components/pull/29589)) |
| [b2a32e9898](https://github.com/angular/components/commit/b2a32e9898de1c625a4398c83842666e9ff7f91b) | fix | **menu:** inconsistent layout of submenu icon ([#29603](https://github.com/angular/components/pull/29603)) |
| [5f0c89030e](https://github.com/angular/components/commit/5f0c89030ea355a080a4486c6dbdabf7f3bd8908) | fix | **tabs:** switch pagination to not use native buttons ([#29605](https://github.com/angular/components/pull/29605)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.0"></a>
# 18.2.0 "technetium-tapas" (2024-08-14)
## Deprecations
### material
- Tree controller deprecated. Use one of levelAccessor or childrenAccessor instead. To be removed in a future version.
   * BaseTreeControl, TreeControl, FlatTreeControl, and NestedTreeControl deprecated
   * CdkTree#treeControl deprecated. Provide one of CdkTree#levelAccessor or CdkTree#childrenAccessor instead.
   * MatTreeFlattener deprecated. Use MatTree#childrenAccessor and MatTreeNode#isExpandable instead.
   * MatTreeFlatDataSource deprecated. Use one of levelAccessor or childrenAccessor instead of TreeControl.

  Note when upgrading: isExpandable works differently on Trees using treeControl than trees using childrenAccessor or levelAccessor. Nodes on trees that have a treeControl are expandable by default. Nodes on trees using childrenAccessor or levelAccessor are *not* expandable by default. Provide isExpandable to override default behavior.
- Setting tabindex of tree nodes deprecated. By default, Tree ignores tabindex passed to tree nodes.
   * MatTreeNode#tabIndex deprecated. MatTreeNode ignores Input tabIndex and manages its own focus behavior.
   * MatTreeNode#defaultTabIndex deprecated. MatTreeNode ignores defaultTabIndex and manages its own focus behavior.
   * MatNestedTreeNode#tabIndex deprecated. MatTreeNode ignores Input defaultTabIndex and manages its own focus behavior.
   * LegacyTreeKeyManager and LEGACY_TREE_KEY_MANAGER_FACTORY_PROVIDER deprecated. Inject a TreeKeyManagerFactory to customize keyboard behavior.

  Note when upgrading: an opt-out is available for keyboard functionality changes. Provide LEGACY_TREE_KEY_MANAGER_FACTORY_PROVIDER to opt-out of Tree managing its own focus. When provided, Tree does not manage it’s own focus and respects tabindex passed to TreeNode. When provided, have the same focus behavior as before this commit is applied.

  Add Legacy Keyboard Interface demo, which shows usage of LEGACY_TREE_KEY_MANAGER_FACTORY_PROVIDER. Add Custom Key Manager, which shows usage of injecting a TreeKeyManagerStrategy
- disabled renamed to isDisabled.
   * CdkTreeNode#disabled deprecated and alias to CdkTreeNode#isDisabled
### material
| Commit | Type | Description |
| -- | -- | -- |
| [ddc307e28](https://github.com/angular/components/commit/ddc307e28449045c484510ff26798fc1a6efa7c1) | feat | **button-toggle:** allow disabled buttons to be interactive ([#29550](https://github.com/angular/components/pull/29550)) |
| [841760101](https://github.com/angular/components/commit/8417601015e7c3a96a8a6801213e764058ee8aba) | feat | **checkbox:** add the ability to interact with disabled checkboxes ([#29474](https://github.com/angular/components/pull/29474)) |
| [0af3b6175](https://github.com/angular/components/commit/0af3b617505d5f39f2492ba4b7e3e7fd4b74f990) | feat | **radio:** add the ability to interact with disabled radio buttons ([#29490](https://github.com/angular/components/pull/29490)) |
| [4292e1b3a](https://github.com/angular/components/commit/4292e1b3a05492e62413f3a62e082f2b8b012026) | feat | **slide-toggle:** add the ability to interact with disabled toggle ([#29502](https://github.com/angular/components/pull/29502)) |
| [a018fb0ee](https://github.com/angular/components/commit/a018fb0ee8ac711e7fba7d0d528fa56f348f6361) | feat | **tooltip:** replicate tooltipClass to default MatTooltipDefaultOptions ([#29467](https://github.com/angular/components/pull/29467)) |
| [aaf0d5156](https://github.com/angular/components/commit/aaf0d51569c0a5626055ca61663d6dbe9fbd1776) | fix | **checkbox:** account for disabledInteractive in harness |
| [d22a24d66](https://github.com/angular/components/commit/d22a24d667a16c39d4a4ec5f59b248f990fa029e) | fix | **list:** checkmark not visible in high contrast mode ([#29546](https://github.com/angular/components/pull/29546)) |
| [a259b016b](https://github.com/angular/components/commit/a259b016b0ef37511c7b6b887da93bacef91f243) | fix | **radio:** account for disabledInteractive in harness |
| [fd47a0e60](https://github.com/angular/components/commit/fd47a0e60dd9ab50d9f923713ca60a7fd21ccc16) | fix | **radio:** avoid error if destroyed quickly ([#29507](https://github.com/angular/components/pull/29507)) |
| [08d2e3e69](https://github.com/angular/components/commit/08d2e3e6945a5488171f5211891d0c2a806808b7) | fix | **slide-toggle:** account for disabledInteractive in harness |
| [fd416a30e](https://github.com/angular/components/commit/fd416a30e8de0e741ac45f3fb45e695abecf5ded) | fix | **tooltip:** remove aria-describedby when disabled ([#29520](https://github.com/angular/components/pull/29520)) |
| [ff36c80f9](https://github.com/angular/components/commit/ff36c80f9c7a14f0e9f36eafc3e1423d34e7c916) | fix | **tree:** add levelAccessor, childrenAccessor, TreeKeyManager; a11y and docs improvements ([#29062](https://github.com/angular/components/pull/29062)) |
| [1f992d06c](https://github.com/angular/components/commit/1f992d06c693a6e09332ac83d837c9ff8e1fdf7b) | fix | **tree:** aria-expanded attribute should not appear in the leaf node ([#29273](https://github.com/angular/components/pull/29273)) |
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [b2c051d2c](https://github.com/angular/components/commit/b2c051d2c1b67f4c149aee1573a4aceddb496157) | feat | **drag-drop:** add input to specify dragged item scale ([#29392](https://github.com/angular/components/pull/29392)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [db5b8dc29](https://github.com/angular/components/commit/db5b8dc29b900470523bb20eea1ba255c2dc1168) | feat | fallback to system level variables ([#29480](https://github.com/angular/components/pull/29480)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.5"></a>
# 18.1.5 "ruthenium-roulette" (2024-08-14)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [b2e728db9](https://github.com/angular/components/commit/b2e728db9789d970990455617338683a68d34a0c) | fix | **form-field:** update state if control changes ([#29573](https://github.com/angular/components/pull/29573)) |
| [1c438b312](https://github.com/angular/components/commit/1c438b312ece5ce29b6f0d60c6696b4afb5396af) | fix | **schematics:** Generate more accurate tonal palettes for M3 schematic ([#29536](https://github.com/angular/components/pull/29536)) |
| [838d1a45a](https://github.com/angular/components/commit/838d1a45a213b41c42a320e16701b25e99fae7ec) | fix | **tabs:** allow for tablist aria-label and aria-labelledby to be set ([#29562](https://github.com/angular/components/pull/29562)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.4"></a>
# 18.1.4 "pewter-polka" (2024-08-07)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [2b5ae8c0ed](https://github.com/angular/components/commit/2b5ae8c0edc6e5c435dd729e704c397cfead2896) | fix | **chips:** missing tokens in M3 ([#29531](https://github.com/angular/components/pull/29531)) |
| [b98432839e](https://github.com/angular/components/commit/b98432839ef879757452a48b149fad0e289e3aae) | fix | **sidenav:** disable focus trap while closed ([#29548](https://github.com/angular/components/pull/29548)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.3"></a>
# 18.1.3 "plastic-beach" (2024-07-31)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [2c76917779](https://github.com/angular/components/commit/2c7691777915e1fd051fd22458980e63fa15958d) | fix | **coercion:** Return undefined when the fallback value is undefined ([#29491](https://github.com/angular/components/pull/29491)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [caf4b61ead](https://github.com/angular/components/commit/caf4b61eadce6c8c407cc5a66a8b420a6a2d805f) | fix | **chips:** remove tab-index attribute from mat-chip host ([#29436](https://github.com/angular/components/pull/29436)) |
| [913267c0b1](https://github.com/angular/components/commit/913267c0b18bee9b47bdb860b9c5c584b84a609c) | fix | **core:** custom system-level variable prefix not used in some mixins ([#29513](https://github.com/angular/components/pull/29513)) |
| [70048ef226](https://github.com/angular/components/commit/70048ef226fab98a60067f87fc2ace6e2003afa8) | fix | **dialog:** invalid font-family declaration ([#29516](https://github.com/angular/components/pull/29516)) |
| [d7d82e1455](https://github.com/angular/components/commit/d7d82e145501321de195bc26e428a05314878d5f) | fix | **slide-toggle:** don't trigger active state for entire container ([#29514](https://github.com/angular/components/pull/29514)) |
| [d237e7d2c7](https://github.com/angular/components/commit/d237e7d2c76ab11a4089a35a3b3a77f2515ac713) | fix | **slide-toggle:** remove divs from button ([#29485](https://github.com/angular/components/pull/29485)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.2"></a>
# 18.1.2 "velvet-violin" (2024-07-24)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [cf61af53bd](https://github.com/angular/components/commit/cf61af53bdb5178cfc80157b9abae2ca1819f4b0) | fix | **chips:** remove button is too small ([#29351](https://github.com/angular/components/pull/29351)) |
| [c79ec264aa](https://github.com/angular/components/commit/c79ec264aa454b31f6cefa6a1b032884c565ae2e) | fix | **form-field:** hiding a label after it has been ([#29461](https://github.com/angular/components/pull/29461)) |
| [15238d255f](https://github.com/angular/components/commit/15238d255f563348677fd81690735a708d3bda5c) | fix | **input:** Number input not changing on wheel interaction ([#29449](https://github.com/angular/components/pull/29449)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.1"></a>
# 18.1.1 "tantalum-tale" (2024-07-17)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [ca634cb7b](https://github.com/angular/components/commit/ca634cb7ba6800b2dc23b15b319d8aef6ede64df) | fix | **drag-drop:** remove preview after animate to placeholder animation completes ([#29439](https://github.com/angular/components/pull/29439)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [b7959c241](https://github.com/angular/components/commit/b7959c241d56ebfbcfb09c2fdce12ebdc6e2d6ad) | fix | **button:** support palettes for icon button in M3 ([#29433](https://github.com/angular/components/pull/29433)) |
| [ffe1c35c0](https://github.com/angular/components/commit/ffe1c35c0b2b59acfbc49bfc345e477f680e1f44) | fix | **chips:** fix focus issue ([#29427](https://github.com/angular/components/pull/29427)) |
| [57cc0b04b](https://github.com/angular/components/commit/57cc0b04b4be19b3cba08ae509e066f7ba40e61d) | fix | **core:** require theme for option typography ([#29416](https://github.com/angular/components/pull/29416)) |
| [2e5e415ec](https://github.com/angular/components/commit/2e5e415ec573b2fd6593b116429080fbe7b24dc2) | fix | **tabs:** prevent tab header from collapsing when empty inside a drop list ([#29418](https://github.com/angular/components/pull/29418)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.0"></a>
# 18.1.0 "coral-odyssey" (2024-07-10)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [0bc6583892](https://github.com/angular/components/commit/0bc65838926e88723bfc677fc3e4de81826cfe5b) | feat | **drag-drop:** add mixed orientation support |
| [b5e30156c1](https://github.com/angular/components/commit/b5e30156c110b67fa5633062227b8767fe601532) | feat | **drag-drop:** add the ability to specify an alternate drop list container ([#29283](https://github.com/angular/components/pull/29283)) |
| [03d4e134c8](https://github.com/angular/components/commit/03d4e134c84f4e9bba6e222e68f7fcc2e3dd3935) | fix | **drag-drop:** reset pointer events on descendants ([#29370](https://github.com/angular/components/pull/29370)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [5da528e44d](https://github.com/angular/components/commit/5da528e44d6fadca6e13f34b86f180a4b5239049) | feat | **button:** allow button color to be configured through DI ([#29297](https://github.com/angular/components/pull/29297)) |
| [6f698fa4e2](https://github.com/angular/components/commit/6f698fa4e24ef4637b2c83f43cb608df967a78b5) | feat | **core:** add option to configure prefix of system variables ([#29139](https://github.com/angular/components/pull/29139)) |
| [5a97c03928](https://github.com/angular/components/commit/5a97c03928a8f4063353015747da37a39efad6a3) | fix | **chips:** navigate between rows on up/down arrow ([#29364](https://github.com/angular/components/pull/29364)) |
| [566057b8f5](https://github.com/angular/components/commit/566057b8f58fab1b5328cbd4336b7b19ea412fd3) | fix | **divider:** non-text color contrast issues ([#28995](https://github.com/angular/components/pull/28995)) |
| [65b56400bd](https://github.com/angular/components/commit/65b56400bd69035d291867a81257fad2dcb3ed5a) | fix | **tabs:** remove visibility style when hydrating ([#29220](https://github.com/angular/components/pull/29220)) |
### cdk-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [fc6beeae18](https://github.com/angular/components/commit/fc6beeae18cba6ff5744a8381aee6edf6211cb5e) | fix | **popover-edit:** Fix dialog role and allow aria label on popup ([#29380](https://github.com/angular/components/pull/29380)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [aa17c2d128](https://github.com/angular/components/commit/aa17c2d128c6a2e6a9a5b4b0f943b7b792ac5bea) | fix | remove workarounds for formControl directive ([#29296](https://github.com/angular/components/pull/29296)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.6"></a>
# 18.0.6 "gallium-grape" (2024-07-03)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [e5c5f151c](https://github.com/angular/components/commit/e5c5f151cc3a5293f629bfa84bcddb0b391cf268) | fix | **core:** add fallback if ripples get stuck ([#29323](https://github.com/angular/components/pull/29323)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.5"></a>
# 18.0.5 "plastic-puppy" (2024-06-26)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [0be4013d90](https://github.com/angular/components/commit/0be4013d90aad3a2c4b18d2d6fccaf3a30d1830f) | fix | **a11y:** Make focus-trap behavior consistent across zoneful/zoneless ([#29225](https://github.com/angular/components/pull/29225)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [fad2a074e2](https://github.com/angular/components/commit/fad2a074e2f5ee4bac9ddb68486427ae66a2433d) | fix | **button-toggle:** skip disabled buttons during keyboard navigation ([#29308](https://github.com/angular/components/pull/29308)) |
| [e5684fe2b7](https://github.com/angular/components/commit/e5684fe2b7964fc9c614a45568b99f1d24982f3f) | fix | **button:** stack icons on top of touch target ([#29291](https://github.com/angular/components/pull/29291)) |
| [c1a40a26d1](https://github.com/angular/components/commit/c1a40a26d164a766efd3ef863b52de18b3bb4d09) | fix | **datepicker:** avoid losing focus when re-rendering the current view ([#29287](https://github.com/angular/components/pull/29287)) |
| [7f575daab5](https://github.com/angular/components/commit/7f575daab5de7e77ef8346c5a85eb59108b76a48) | fix | **sidenav:** not closing on escape key press ([#29292](https://github.com/angular/components/pull/29292)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.4"></a>
# 18.0.4 "caesium-carnival" (2024-06-20)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [8e7ac0804](https://github.com/angular/components/commit/8e7ac0804844f7dee57eca2445b4a9f17a094e4d) | fix | **overlay:** incorrectly dispatching outside click for shadow DOM ([#29249](https://github.com/angular/components/pull/29249)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [303984fd9](https://github.com/angular/components/commit/303984fd9e262e3e434afb56bf2b29c0ef79ab92) | fix | **autocomplete:** autocomplete panel top is cut off in landscape mode ([#28982](https://github.com/angular/components/pull/28982)) |
| [69ae4040e](https://github.com/angular/components/commit/69ae4040e558d9f10004cff81bdd453ed260abd9) | fix | **bottom-sheet:** changed after checked error with zoneless ([#29277](https://github.com/angular/components/pull/29277)) |
| [317e371f0](https://github.com/angular/components/commit/317e371f0d6e47e7bf0fff7f72ab731d0727e53a) | fix | **core:** generate mat-optgroup tokens in M3 ([#29257](https://github.com/angular/components/pull/29257)) |
| [93bc60964](https://github.com/angular/components/commit/93bc6096463bbc33c7430b75214cbc2400ac6a91) | fix | **core:** implement elevation classes in M3 |
| [6310016f2](https://github.com/angular/components/commit/6310016f27263f08ac449971dd50914effcd2d90) | fix | **form-field:** outline label position ([#29138](https://github.com/angular/components/pull/29138)) |
| [ce195dee4](https://github.com/angular/components/commit/ce195dee400616afd405c26464c03a5085fe3161) | fix | **menu:** animation issue when same menu is used for multiple nested triggers ([#29280](https://github.com/angular/components/pull/29280)) |
| [9988ef2f5](https://github.com/angular/components/commit/9988ef2f5e632cd216a29067a593957013b4f108) | fix | **menu:** update elevation logic for M3 |
| [bad8f6ad4](https://github.com/angular/components/commit/bad8f6ad4472c7533990c05589ce134c925314dd) | fix | **paginator:** items per page form field touch target size insufficient ([#29109](https://github.com/angular/components/pull/29109)) |
| [f834a11d2](https://github.com/angular/components/commit/f834a11d2c9216daf0c7f9e23a7f1bbc67b40591) | fix | **tree:** aria-expanded attribute should not appear in the leaf node ([#29096](https://github.com/angular/components/pull/29096)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.3"></a>
# 18.0.3 "gossamer-glacier" (2024-06-12)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [f6b993fdb7](https://github.com/angular/components/commit/f6b993fdb7fbdcfbe0297d320a5961097002308d) | fix | **dialog:** Make autofocus work with animations disabled ([#29195](https://github.com/angular/components/pull/29195)) |
| [6dd1689b51](https://github.com/angular/components/commit/6dd1689b519abf287098d30f7698fc37197e3db0) | fix | **dialog:** Make focus behavior consistent across zoneful/zoneless apps ([#29192](https://github.com/angular/components/pull/29192)) |
| [81d4527f91](https://github.com/angular/components/commit/81d4527f9130605f69dea31a092a60261bde25db) | fix | **radio:** mark radio-group for check on touch ([#29203](https://github.com/angular/components/pull/29203)) |
| [0f4d1862d3](https://github.com/angular/components/commit/0f4d1862d30366978176a4a87b7799915d3caedd) | fix | **schematics:** estimate missing hues in M3 schematic ([#29231](https://github.com/angular/components/pull/29231)) |
| [faf348438d](https://github.com/angular/components/commit/faf348438d57db80e8ac5187ffe3900fe398fe77) | fix | **snack-bar:** fix overrides mixin name typo ([#29180](https://github.com/angular/components/pull/29180)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.2"></a>
# 18.0.2 "velvet-viola" (2024-06-05)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [5ef11b1e15](https://github.com/angular/components/commit/5ef11b1e157ff76ad2e92cb047bfc1bd0c60943c) | fix | **testing:** TestbedHarnessEnvironment should work when Zone is not present ([#29176](https://github.com/angular/components/pull/29176)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [dfc19e2884](https://github.com/angular/components/commit/dfc19e28845b149aafa060e5b334bdd99b3c3bff) | fix | **core:** hide ripples inside drag&drop elements ([#29184](https://github.com/angular/components/pull/29184)) |
| [51488a2b7e](https://github.com/angular/components/commit/51488a2b7e807a41d03753c49bd18aee091fab7a) | fix | **datepicker:** Move aria-live attribute so month can also be announced when using previous and next month buttons ([#29137](https://github.com/angular/components/pull/29137)) |
| [3945ed62cd](https://github.com/angular/components/commit/3945ed62cd102db07a600d2c3d1eae51844dcae6) | fix | **radio:** Ensure focus and selected states stay linked ([#29082](https://github.com/angular/components/pull/29082)) |
| [8d44ed99c6](https://github.com/angular/components/commit/8d44ed99c69e9ee40881a80b1916998383a0cddf) | fix | **schematics:** theming API migration not working with CRLF line endings ([#29171](https://github.com/angular/components/pull/29171)) |
| [5e3d13d559](https://github.com/angular/components/commit/5e3d13d559c963b8b913ef35569cfbfe01ea207a) | fix | **slider:** Tick marks changes position as the slider is changed (for a step that is decimal number) ([#29108](https://github.com/angular/components/pull/29108)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.1"></a>
# 18.0.1 "plastic-baby" (2024-05-29)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [d96b5e39e0](https://github.com/angular/components/commit/d96b5e39e08945b5b4ec92dbc89a7ef44dec1baa) | fix | **core:** M3 themes not inserting loaded marker |
| [b7c0a6ef56](https://github.com/angular/components/commit/b7c0a6ef56ade6d99e9b097e0d616e9e3bb5a9f5) | fix | **form-field:** outline label position ([#29123](https://github.com/angular/components/pull/29123)) |
| [24de3d4884](https://github.com/angular/components/commit/24de3d4884677c427e036258eb2e999a89da03e5) | fix | **menu:** prevent divider styles from bleeding out ([#29111](https://github.com/angular/components/pull/29111)) |
| [2110f2c97e](https://github.com/angular/components/commit/2110f2c97ec8d9b84ee4f8bcd47ca7b95d398879) | fix | **tabs:** avoid pagination infinite loop in safari ([#29121](https://github.com/angular/components/pull/29121)) |
### youtube-player
| Commit | Type | Description |
| -- | -- | -- |
| [466e249cd1](https://github.com/angular/components/commit/466e249cd1eb4b8ce9dd2f9f74c3f4c3cb33cf65) | fix | error when interacting with the player before the API has been loaded ([#29127](https://github.com/angular/components/pull/29127)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.0"></a>
# 18.0.0 "satin-sasquatch" (2024-05-22)
## Breaking Changes
### material
- The following APIs have been renamed. If you update using `ng update`, your app will be fixed automatically.
  * `define-light-theme` to `m2-define-light-theme`
  * `define-dark-theme` to `m2-define-dark-theme`
  * `define-palette` to `m2-define-palette`
  * `get-contrast-color-from-palette` to `m2-get-contrast-color-from-palette`
  * `get-color-from-palette` to `m2-get-color-from-palette`
  * `get-color-config` to `m2-get-color-config`
  * `get-typography-config` to `m2-get-typography-config`
  * `get-density-config` to `m2-get-density-config`
  * `$red-palette` to `$m2-red-palette`
  * `$pink-palette` to `$m2-pink-palette`
  * `$indigo-palette` to `$m2-indigo-palette`
  * `$purple-palette` to `$m2-purple-palette`
  * `$deep-purple-palette` to `$m2-deep-purple-palette`
  * `$blue-palette` to `$m2-blue-palette`
  * `$light-blue-palette` to `$m2-light-blue-palette`
  * `$cyan-palette` to `$m2-cyan-palette`
  * `$teal-palette` to `$m2-teal-palette`
  * `$green-palette` to `$m2-green-palette`
  * `$light-green-palette` to `$m2-light-green-palette`
  * `$lime-palette` to `$m2-lime-palette`
  * `$yellow-palette` to `$m2-yellow-palette`
  * `$amber-palette` to `$m2-amber-palette`
  * `$orange-palette` to `$m2-orange-palette`
  * `$deep-orange-palette` to `$m2-deep-orange-palette`
  * `$brown-palette` to `$m2-brown-palette`
  * `$grey-palette` to `$m2-grey-palette`
  * `$gray-palette` to `$m2-gray-palette`
  * `$blue-grey-palette` to `$m2-blue-grey-palette`
  * `$blue-gray-palette` to `$m2-blue-gray-palette`
  * `$light-theme-background-palette` to `$m2-light-theme-background-palette`
  * `$dark-theme-background-palette` to `$m2-dark-theme-background-palette`
  * `$light-theme-foreground-palette` to `$m2-light-theme-foreground-palette`
  * `$dark-theme-foreground-palette` to `$m2-dark-theme-foreground-palette`
  * `define-typography-level` to `m2-define-typography-level`
  * `define-rem-typography-config` to `m2-define-rem-typography-config`
  * `define-typography-config` to `m2-define-typography-config`
  * `define-legacy-typography-config` to `m2-define-legacy-typography-config`
  * `typography-level` to `m2-typography-level`
  * `font-size` to `m2-font-size`
  * `line-height` to `m2-line-height`
  * `font-weight` to `m2-font-weight`
  * `letter-spacing` to `m2-letter-spacing`
  * `font-family` to `m2-font-family`
  * `font-shorthand` to `m2-font-shorthand`
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [c345df788](https://github.com/angular/components/commit/c345df7889c4f08076657ed37f901c975f762c3c) | feat | **theming:** add mixin for customizing checkbox tokens ([#28759](https://github.com/angular/components/pull/28759)) |
| [c932512ba](https://github.com/angular/components/commit/c932512bab15b59883453b3e6dc9f896239fd65d) | fix | **theming:** avoid re-emitting the same tokens from the backwards-compatibility styles |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [4473a379f](https://github.com/angular/components/commit/4473a379f1f3a004526eca97aa7b75b82d60ae2d) | feat | **core:** add prebuilt themes based on M3 |
| [e2a45bf1e](https://github.com/angular/components/commit/e2a45bf1e5e49daf2c23c6f737ee959f57b41cf9) | feat | **core:** Allow namespacing ripple-loader event handler ([#28699](https://github.com/angular/components/pull/28699)) |
| [d679024de](https://github.com/angular/components/commit/d679024dec9c3c5e697e0c72caadaced3a87f67b) | feat | **core:** move Material 3 support into stable ([#28913](https://github.com/angular/components/pull/28913)) |
| [4ba4689dc](https://github.com/angular/components/commit/4ba4689dcd54adfcb9be6469fc2c7ee1d9ceefe3) | feat | **core:** namespace m2-specific theming APIs ([#28892](https://github.com/angular/components/pull/28892)) |
| [295fd67fa](https://github.com/angular/components/commit/295fd67fa806d6f8687afdb998769718d4b103d1) | feat | **schematics:** Add custom M3 theme schematic ([#28766](https://github.com/angular/components/pull/28766)) |
| [b312b9491](https://github.com/angular/components/commit/b312b9491e736953ad29756b74e9f74df49ff88b) | feat | **schematics:** use M3 themes in schematics |
| [f8bd658df](https://github.com/angular/components/commit/f8bd658df3eb86834a6df4fbd7819c7b8d3c90b7) | feat | **theming:** add ability to use sys variables ([#28898](https://github.com/angular/components/pull/28898)) |
| [49901c640](https://github.com/angular/components/commit/49901c640083039291acd6eb1a596c7d6d3d6f92) | fix | **button-toggle:** use radio pattern for single select Mat toggle button group ([#28548](https://github.com/angular/components/pull/28548)) |
| [5501d9b40](https://github.com/angular/components/commit/5501d9b408b976cda848188aa5e2df00f64e4443) | fix | **core:** add migration for M2 theming APIs ([#28927](https://github.com/angular/components/pull/28927)) |
| [0ccc52830](https://github.com/angular/components/commit/0ccc52830e8d663537e391978f7ce43f4d952a5d) | fix | **core:** export all available M3 palettes ([#28975](https://github.com/angular/components/pull/28975)) |
| [a5ad288bf](https://github.com/angular/components/commit/a5ad288bffb063cc27bc562df62a824e57968d2f) | fix | **core:** ripple loader not working in shadow DOM ([#29015](https://github.com/angular/components/pull/29015)) |
| [ec9e83db4](https://github.com/angular/components/commit/ec9e83db4c6f47a8095bdc83b5e9cce9f7e2cbc2) | fix | **datepicker:** resolve repeater warnings in calendar ([#29028](https://github.com/angular/components/pull/29028)) |
| [6dc8f7e90](https://github.com/angular/components/commit/6dc8f7e90d05b7136daa8f99e0dc28ae5052848b) | fix | **dialog:** mark dialog content as scrollable ([#28963](https://github.com/angular/components/pull/28963)) |
| [ae82909a9](https://github.com/angular/components/commit/ae82909a95a4f51ee82b704db5e724f83b6806d0) | fix | **schematics:** Add css token renaming migration |
| [3e9d3c394](https://github.com/angular/components/commit/3e9d3c39441084f34de8e8798382c68732213e2c) | fix | **schematics:** add option to generate system variables in M3 schematic |
| [bdb17c6b3](https://github.com/angular/components/commit/bdb17c6b34c7c236a2112407e57790005f544d3b) | fix | **schematics:** Change themeTypes to a single select instead of a multiselect prompt in M3 theme schematic ([#28997](https://github.com/angular/components/pull/28997)) |
| [c86359dd4](https://github.com/angular/components/commit/c86359dd438e0c7d346372fdaa359a0b1465e7a9) | fix | **slide-toggle:** no outline when selected in high contrast mode ([#28979](https://github.com/angular/components/pull/28979)) |
| [d4e61e233](https://github.com/angular/components/commit/d4e61e233088ce0d5bbfb6cf3ff652e303e7e38d) | fix | **table:** use ResizeObserver to react to size changes ([#28783](https://github.com/angular/components/pull/28783)) |
| [a4fc0a097](https://github.com/angular/components/commit/a4fc0a097070729f490429462268ea9d68ae85e2) | fix | **theming:** remove shadow css variable ([#28953](https://github.com/angular/components/pull/28953)) |
| [0bb5610d0](https://github.com/angular/components/commit/0bb5610d03553ac8e8459aa9ad89a3eaf82d7dbd) | fix | **theming:** restrict css color usage behind a flag ([#28944](https://github.com/angular/components/pull/28944)) |
| [a332146ff](https://github.com/angular/components/commit/a332146ff57e638fcc1e0f73aa59b5abad2bb883) | perf | **core:** speed up M3 compilation ([#29009](https://github.com/angular/components/pull/29009)) |
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [d8a6c3edd](https://github.com/angular/components/commit/d8a6c3edd8d406b3f1b1c26805612eac8856b745) | fix | **observers:** don't observe content of comments ([#28858](https://github.com/angular/components/pull/28858)) |
| [81fe8f322](https://github.com/angular/components/commit/81fe8f32273b3769c92a7482fcd0383e3e2c80f3) | fix | **observers:** Run content changed callback in NgZone ([#28870](https://github.com/angular/components/pull/28870)) |
| [108cce33b](https://github.com/angular/components/commit/108cce33bfb331fcdce18527480b3a89f5f81a28) | fix | **overlay:** Remove use of zone onStable to detach content ([#28740](https://github.com/angular/components/pull/28740)) |
| [d91d0d424](https://github.com/angular/components/commit/d91d0d424b043c4da7b69d296967e62a751eac23) | fix | **scrolling:** fix virtual scrolling jankiness with run coalescing ([#28846](https://github.com/angular/components/pull/28846)) |
| [c8b62a154](https://github.com/angular/components/commit/c8b62a154992912046d52113b08408065f3772fd) | fix | **scrolling:** fix virtual scrolling jankiness with run coalescing ([#28968](https://github.com/angular/components/pull/28968)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [4719da2c3](https://github.com/angular/components/commit/4719da2c34bee87095a2368334715e415f18a4c3) | feat | token overrides api ([#28910](https://github.com/angular/components/pull/28910)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.10"></a>
# 17.3.10 "soft-starfish" (2024-05-22)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [a22b29bd2](https://github.com/angular/components/commit/a22b29bd26f2073cd66c7f3ce293a5400781d60e) | fix | **drag-drop:** defer loading reset styles ([#29056](https://github.com/angular/components/pull/29056)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [4cc7c1585](https://github.com/angular/components/commit/4cc7c15859a4e6780117ec55f02e41410172aa4e) | fix | **chips:** simplify repeat chip removal prevention ([#29048](https://github.com/angular/components/pull/29048)) |
| [2f0f57691](https://github.com/angular/components/commit/2f0f57691f72c96c8ef8f3e56f4b656f6a9e6605) | fix | **slider:** aria-valuetext host binding should be onPush compatible ([#29042](https://github.com/angular/components/pull/29042)) |
| [080164e62](https://github.com/angular/components/commit/080164e626c8bab8f5db46a22358e7247880f34a) | fix | **slider:** resolve duplicate key warnings ([#29073](https://github.com/angular/components/pull/29073)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.9"></a>
# 17.3.9 "orange-ornament" (2024-05-15)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [ba8137dfa](https://github.com/angular/components/commit/ba8137dfa60a5f092db4d70bb318ac34d94e0b82) | fix | **observers:** logs "ResizeObserver loop limit exceeded" errors ([#29036](https://github.com/angular/components/pull/29036)) |
| [6d9c2e7b3](https://github.com/angular/components/commit/6d9c2e7b398d1b9bd0ae872d9b5108638544bd80) | fix | **overlay:** skip trigger interactions in outside click event ([#29044](https://github.com/angular/components/pull/29044)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [0b30688d3](https://github.com/angular/components/commit/0b30688d35409e6ede69f40f49a7f83e66a15e8f) | fix | **core:** ripple element not destroyed after trigger change ([#29010](https://github.com/angular/components/pull/29010)) ([#29012](https://github.com/angular/components/pull/29012)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.8"></a>
# 17.3.8 "rock-rope" (2024-05-08)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [23dc148e7f](https://github.com/angular/components/commit/23dc148e7f11fb764ad39cd16f7facf02e2800d8) | fix | **menu:** allow for scroll strategy to be configured ([#29005](https://github.com/angular/components/pull/29005)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [f20105d87e](https://github.com/angular/components/commit/f20105d87eb40e969b29433585dd61df5bb83bd9) | fix | **button:** incorrect template for icon button anchor ([#28996](https://github.com/angular/components/pull/28996)) |
| [72baa7cff2](https://github.com/angular/components/commit/72baa7cff2d3b24a100422207e8631c8bd1fd03b) | fix | **chips:** highlighted not working in M3 ([#29001](https://github.com/angular/components/pull/29001)) |
| [cf0785cd67](https://github.com/angular/components/commit/cf0785cd672796bc369ac12bdf806ccbd0c30486) | fix | **tooltip:** Tooltip should mark for check when visibility changes ([#29000](https://github.com/angular/components/pull/29000)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.7"></a>
# 17.3.7 "plastic-deer" (2024-05-02)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [3c8abfb990](https://github.com/angular/components/commit/3c8abfb9902e06af2d73b8b536ce65c9d04442df) | fix | **drag-drop:** remove preview wrapper |
| [a03a47c938](https://github.com/angular/components/commit/a03a47c93845fc6f8d917d588739599b63ce1608) | fix | **drag-drop:** reset user agent color on preview popover |
| [8e3dfd2e5b](https://github.com/angular/components/commit/8e3dfd2e5b5e5c12cacb598581598e998456bd11) | fix | **drag-drop:** resolve incompatibility with property minification ([#28980](https://github.com/angular/components/pull/28980)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.6"></a>
# 17.3.6 "onyx-whisper" (2024-04-24)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [c2dc2da71e](https://github.com/angular/components/commit/c2dc2da71e56faf6291c2ff3213baa032f3731be) | fix | **a11y:** handle signal based items in list key manager ([#28854](https://github.com/angular/components/pull/28854)) |
| [e33c436c73](https://github.com/angular/components/commit/e33c436c73941f27d687387ba1090985fc337e9c) | fix | **drag-drop:** use native popover to avoid stacking issues with preview |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [d78c7706c6](https://github.com/angular/components/commit/d78c7706c60ac679b9f55cd9a0c27d959833f8ff) | fix | **progress-bar:** avoid CSP issues for apps not using buffer mode ([#28946](https://github.com/angular/components/pull/28946)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [73d1e2e3cf](https://github.com/angular/components/commit/73d1e2e3cf530fafadc7a490ea8542487d6a325b) | fix | remove label for attribute on non-native elements ([#28948](https://github.com/angular/components/pull/28948)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.5"></a>
# 17.3.5 "titanium-bear" (2024-04-17)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [8c8fe2b65](https://github.com/angular/components/commit/8c8fe2b6556d4ba7463e9ab51ca967568e1ca99f) | fix | **drag-drop:** text selection not disabled inside shadow dom on firefox ([#28835](https://github.com/angular/components/pull/28835)) |
| [312d57a9b](https://github.com/angular/components/commit/312d57a9bcf267cb4c8c7147db8105553c084626) | fix | **observers:** don't observe content of comments ([#28871](https://github.com/angular/components/pull/28871)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [80437d83b](https://github.com/angular/components/commit/80437d83b745242668891b17dbc5050d8588d6a8) | fix | **autocomplete:** panel not visible when opened from multiple triggers ([#28843](https://github.com/angular/components/pull/28843)) |
| [69b5ded96](https://github.com/angular/components/commit/69b5ded96730c1cf15e92b8a1d577391b3d4d7de) | fix | **autocomplete:** remove dependency on NgClass ([#28849](https://github.com/angular/components/pull/28849)) |
| [4a56d6afa](https://github.com/angular/components/commit/4a56d6afa4474c7229369853c91b493b29fdb6fb) | fix | **core:** throw better error when mixin doesn't support color variants ([#28880](https://github.com/angular/components/pull/28880)) |
| [cbe0a78f7](https://github.com/angular/components/commit/cbe0a78f7f085817df96d24aa5dfa9d92317bba6) | fix | **datepicker:** remove dependency on NgClass ([#28865](https://github.com/angular/components/pull/28865)) |
| [7a085c6e0](https://github.com/angular/components/commit/7a085c6e073741a350d2712d347172e4dc92ac29) | fix | **menu:** remove dependency on NgClass ([#28877](https://github.com/angular/components/pull/28877)) |
| [4c16d2cd8](https://github.com/angular/components/commit/4c16d2cd8c1e4a1607482181c1a39ce73fb72856) | fix | **tabs:** remove dependency on NgClass ([#28875](https://github.com/angular/components/pull/28875)) |
### google-maps
| Commit | Type | Description |
| -- | -- | -- |
| [d99167eb3](https://github.com/angular/components/commit/d99167eb3a4386a4d12d23f6d11a16911840a5de) | fix | make info window open method compatible with advanced marker |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.4"></a>
# 17.3.4 "aluminum-arrow" (2024-04-11)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [09dcbd2ecf](https://github.com/angular/components/commit/09dcbd2ecfa4b9c93835fa95ce9c917f02858471) | fix | **drag-drop:** make sure event is cancelable before calling "preventDefault" ([#28825](https://github.com/angular/components/pull/28825)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [36a1d45e4e](https://github.com/angular/components/commit/36a1d45e4e0aabea40d6addfa4a11cec51c71f64) | fix | **list:** nav list item border-radius ([#28789](https://github.com/angular/components/pull/28789)) |
| [317327d82b](https://github.com/angular/components/commit/317327d82ba3b67d14a135dde865f221f475647c) | fix | **menu:** invert arrow in RTL ([#28830](https://github.com/angular/components/pull/28830)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.3"></a>
# 17.3.3 "metal-fork" (2024-04-03)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [7ccc392936](https://github.com/angular/components/commit/7ccc3929362a96e29d59a5904dc2fba5495bdbcb) | fix | **button-toggle:** standard button toggle strong focus bord… ([#28790](https://github.com/angular/components/pull/28790)) |
| [8b92fda61f](https://github.com/angular/components/commit/8b92fda61fa8299022d1cfd71607908d4fdcb2d1) | fix | **sort:** clear aria description on destroy ([#28801](https://github.com/angular/components/pull/28801)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [6b5b0c5db3](https://github.com/angular/components/commit/6b5b0c5db3d3157f1b9f8d0a6a71fdcdfc003cc1) | fix | set nonce using setAttribute ([#28800](https://github.com/angular/components/pull/28800)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.2"></a>
# 17.3.2 "benitoite-biscuit" (2024-03-28)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [de2388190](https://github.com/angular/components/commit/de2388190eae18689f63f07f96fbfe460fe9e047) | fix | **a11y:** support signals in ListKeyManager ([#28757](https://github.com/angular/components/pull/28757)) |
| [38a12a9f0](https://github.com/angular/components/commit/38a12a9f057a7b8fef6d7a8f0014e4c15a74af4d) | fix | **listbox:** improve SSR compatibility by adding an _isBrowser check before calling _setPreviousActiveOptionAsActiveOptionOnWindowBlur ([#28746](https://github.com/angular/components/pull/28746)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [aee721ec6](https://github.com/angular/components/commit/aee721ec6979538469e5080fac0cfae4f01fa035) | fix | **chips:** use concrete value for remove icon size ([#28751](https://github.com/angular/components/pull/28751)) |
| [4ca9ac56b](https://github.com/angular/components/commit/4ca9ac56b4e5ef38321277bc919b097089b1a28c) | fix | **datepicker:** datepicker row count inaccurate for screen reader ([#28760](https://github.com/angular/components/pull/28760)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.1"></a>
# 17.3.1 "clay-paradox" (2024-03-20)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [31e30883a3](https://github.com/angular/components/commit/31e30883a33d89d277d710a97f81b26b1972c8ba) | fix | **drag-drop:** optionally inject parent drag in preview and placeholder ([#28750](https://github.com/angular/components/pull/28750)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.0"></a>
# 17.3.0 "cobalt-catfish" (2024-03-14)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [26b376e43](https://github.com/angular/components/commit/26b376e43e18e9941f44d4d0714696b863250507) | feat | **tooltip:** be able to customize the longpress delay ([#27512](https://github.com/angular/components/pull/27512)) |
| [09111d002](https://github.com/angular/components/commit/09111d00299c7747ed6543d91e257f7224e1119e) | fix | **button-toggle:** Add checkmark indicators with hideSingleSelectionIndicator and hideMultipleSelectionIndicator input and config options ([#28553](https://github.com/angular/components/pull/28553)) |
| [52da8b33f](https://github.com/angular/components/commit/52da8b33fe62da969e119a6456b076c7445d8f3e) | fix | **core:** avoid solid ripples in buttons ([#28717](https://github.com/angular/components/pull/28717)) |
| [36d82d89c](https://github.com/angular/components/commit/36d82d89c0de445edc7fb19b704bb346b9a859de) | fix | **core:** theming validation for m2 themes firing incorrectly ([#28707](https://github.com/angular/components/pull/28707)) |
| [79b447e2e](https://github.com/angular/components/commit/79b447e2e7b0523326520ba09d163169c13cdfda) | fix | **form-field:** ensure same stacking context as container ([#28713](https://github.com/angular/components/pull/28713)) |
| [63a764de6](https://github.com/angular/components/commit/63a764de6147a5c1cb09f388de454eda9ee3414a) | fix | **slide-toggle:** m3 selected track outline ([#28625](https://github.com/angular/components/pull/28625)) |
| [386f768b6](https://github.com/angular/components/commit/386f768b6c080077a7570ea4f759930641131f6e) | fix | **slider:** fix animation issue ([#28704](https://github.com/angular/components/pull/28704)) |
### google-maps
| Commit | Type | Description |
| -- | -- | -- |
| [b4b91be04](https://github.com/angular/components/commit/b4b91be04e23296060b5e7a041bbf8eeae325ee9) | feat | add advanced marker ([#28525](https://github.com/angular/components/pull/28525)) |
| [cc618b450](https://github.com/angular/components/commit/cc618b4501284e10ad5bb93f358f3d8de2c8e7b7) | fix | advanced marker not destroyed |
| [5269e0f9d](https://github.com/angular/components/commit/5269e0f9d42bd045bc28be144cc7bdd457bacd1e) | fix | mapId not being set |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.2"></a>
# 17.2.2 "metal-marble" (2024-03-06)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [4af777a189](https://github.com/angular/components/commit/4af777a189ca0bd80a5158dafa3d9cf4f60b6bf2) | fix | **drag-drop:** resolve helper directives with DI for proper hostDirectives support ([#28633](https://github.com/angular/components/pull/28633)) |
| [94eafc134f](https://github.com/angular/components/commit/94eafc134fdcb27f4d85fa9ad07a44aadd9b393a) | fix | **overlay:** fix overlay margin in isBoundedByLeftViewportEdge ('left-ward') mode ([#28233](https://github.com/angular/components/pull/28233)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [65aaaf3abf](https://github.com/angular/components/commit/65aaaf3abf137a6c7eb0ff6017eb5977602dd774) | fix | **autocomplete:** prevent hidden overlay from blocking clicks ([#28677](https://github.com/angular/components/pull/28677)) |
| [d08ddaab81](https://github.com/angular/components/commit/d08ddaab818244cdedfe44121dd0d4499587bc46) | fix | **autocomplete:** requireSelection sometimes not clearing value when editing after selection ([#28628](https://github.com/angular/components/pull/28628)) |
| [5b3210bfda](https://github.com/angular/components/commit/5b3210bfda60b4f9e42b33cb2b06fce2a86706e0) | fix | **checkbox:** derive checkmark color from palette |
| [fb20320b82](https://github.com/angular/components/commit/fb20320b823eb6a2880d61b25da29aa9e3262d06) | fix | **chips:** derive surface color from palette |
| [fe01e298a0](https://github.com/angular/components/commit/fe01e298a06fafef21a47f80bd961bd71a7559e9) | fix | **core:** mark fields on HasErrorState as nullable ([#28689](https://github.com/angular/components/pull/28689)) |
| [afbb34e415](https://github.com/angular/components/commit/afbb34e41570428a7003508b552c39accbc1fc9e) | fix | **datepicker:** always move caret to the end of the start input on backspace ([#28669](https://github.com/angular/components/pull/28669)) |
| [ec6f8e2e62](https://github.com/angular/components/commit/ec6f8e2e62341647fda7c8e2bbcbe977165a255f) | fix | **datepicker:** datepicker doesn't announce newly selected range in firefox ([#28529](https://github.com/angular/components/pull/28529)) |
| [ba6e809761](https://github.com/angular/components/commit/ba6e809761cf24efb1037340ca76a336d5ebdcab) | fix | **expansion:** prevent focus from entering the panel while it's animating ([#28646](https://github.com/angular/components/pull/28646)) |
| [07f5ed9dc6](https://github.com/angular/components/commit/07f5ed9dc6f722cee2941e49ad63f04041a3314d) | fix | **schematics:** add typography and density to custom theme ([#28645](https://github.com/angular/components/pull/28645)) |
| [6d8160c166](https://github.com/angular/components/commit/6d8160c1660cbf519c8f709ebb05059e7a9a5865) | fix | **schematics:** don't interrupt ng add if adding the animations module fails ([#28675](https://github.com/angular/components/pull/28675)) |
| [9655ecb872](https://github.com/angular/components/commit/9655ecb87223728af4459157a58eda26c6c9eaf2) | fix | **slide-toggle:** m3 selected track outline ([#28625](https://github.com/angular/components/pull/28625)) ([#28634](https://github.com/angular/components/pull/28634)) |
| [7d352fbf88](https://github.com/angular/components/commit/7d352fbf886dfaa476ce99440f9f6edc80498077) | perf | **form-field:** resolve scrolling performance issues ([#27251](https://github.com/angular/components/pull/27251)) |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [f18ef99785](https://github.com/angular/components/commit/f18ef99785e097ec66f7236d5cfe210ea37e8e52) | feat | **theming:** provide hook for formatting toke… ([#28660](https://github.com/angular/components/pull/28660)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [14c055fe07](https://github.com/angular/components/commit/14c055fe0725f6429beabf2be27e3c4486c29164) | fix | derive all token values from theme ([#28664](https://github.com/angular/components/pull/28664)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.1"></a>
# 17.2.1 "allactite-acorn" (2024-02-22)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [c617cd7c8](https://github.com/angular/components/commit/c617cd7c815cfcebebc608aa4e1c75ea8e6b0629) | fix | **listbox:** make typeahead label nullable ([#28602](https://github.com/angular/components/pull/28602)) |
| [67956e065](https://github.com/angular/components/commit/67956e065178f33ba052ae6e1a148612b3d56f41) | fix | **overlay:** only emit positionChanges when position is different |
| [d5d856348](https://github.com/angular/components/commit/d5d8563489f521490e3a4b04519767b308c33739) | fix | **overlay:** run positionChange event inside the zone |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [0c5781bfc](https://github.com/angular/components/commit/0c5781bfce0e96789d5c415586a0382d64ac3daa) | fix | **expansion:** center indicator icon in M3 ([#28603](https://github.com/angular/components/pull/28603)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.0"></a>
# 17.2.0 "polymer-prism" (2024-02-14)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [55eeee3516](https://github.com/angular/components/commit/55eeee35163d5392703e02f8de044598e74cc6f5) | fix | **listbox:** unable to tab in if active option is removed ([#28583](https://github.com/angular/components/pull/28583)) |
| [2f7aaaa220](https://github.com/angular/components/commit/2f7aaaa22095bdf96a5a6a65a658fd3e01b68cc8) | fix | **table:** error if outlets are assigned too early ([#28551](https://github.com/angular/components/pull/28551)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [99a4e2a10f](https://github.com/angular/components/commit/99a4e2a10ff39599f16f0a9c842963ae1452de92) | fix | **button-toggle:** Add remaining typography tokens needed for M3 ([#28578](https://github.com/angular/components/pull/28578)) |
| [e05795dde0](https://github.com/angular/components/commit/e05795dde0ca56be3398f34cb834df007f18da1a) | fix | **button:** calculate icon button padding based on tokens |
| [a496855f30](https://github.com/angular/components/commit/a496855f303acbf4b82821be029467c577976729) | fix | **button:** generate separate tokens for mini fab |
| [cbeeb3ae17](https://github.com/angular/components/commit/cbeeb3ae1771c4ccbd6c5677cf73ac3d21c593c5) | fix | **checkbox:** use token for disabled label color |
| [0a1c8eedb4](https://github.com/angular/components/commit/0a1c8eedb45c3e24247539abe489ea835d19a0d7) | fix | **chips:** Tokenize chip outline and disabled opacity ([#28488](https://github.com/angular/components/pull/28488)) |
| [58764afec2](https://github.com/angular/components/commit/58764afec2b181c6be1b21f952215c3aa0a160f0) | fix | **chips:** Tokenize the hover & focus overlays ([#28497](https://github.com/angular/components/pull/28497)) |
| [32f86e48e1](https://github.com/angular/components/commit/32f86e48e17caa316baa4738e0f458a64e16e4e5) | fix | **chips:** Tokenize the selected state ([#28498](https://github.com/angular/components/pull/28498)) |
| [1dcc195853](https://github.com/angular/components/commit/1dcc195853a74d1e0b724b742673eb5fd744cb67) | fix | **core:** ensure that option inherits container background |
| [873c8e97dc](https://github.com/angular/components/commit/873c8e97dc4a077ca30d64c4ce629d7011caf10e) | fix | **datepicker:** fix M3 styles ([#28556](https://github.com/angular/components/pull/28556)) |
| [8ac58ff328](https://github.com/angular/components/commit/8ac58ff328aac006e9f22f9f97bf5552050c12ef) | fix | **datepicker:** fix touchui shadow and border-radius ([#28577](https://github.com/angular/components/pull/28577)) |
| [92ab097987](https://github.com/angular/components/commit/92ab0979874945b85554914879b58ab6b7152e39) | fix | **datepicker:** use direction-agnostic text-align |
| [0edc47673f](https://github.com/angular/components/commit/0edc47673f93beb1533788e774d9b739821b33f4) | fix | **form-field:** container height in lower densities ([#28546](https://github.com/angular/components/pull/28546)) |
| [b1f281cab5](https://github.com/angular/components/commit/b1f281cab5d739e5b89d8c057e830fd61e88615b) | fix | **list:** ensure leading icon scales with token |
| [306c2424f7](https://github.com/angular/components/commit/306c2424f7d12383166fb233770c05f063a094cd) | fix | **list:** indexOf usage incorreect for active focus reset ([#28531](https://github.com/angular/components/pull/28531)) |
| [75955eb9b4](https://github.com/angular/components/commit/75955eb9b422709064ceeb681ee9ef35db432102) | fix | **list:** match leading icon size in M3 to spec |
| [b8327cd92c](https://github.com/angular/components/commit/b8327cd92c1f124a5e2c9ef6693354dd76cc5ca9) | fix | **list:** tokenize active-indicator  ([#28586](https://github.com/angular/components/pull/28586)) |
| [ba05521005](https://github.com/angular/components/commit/ba05521005c1d19f6c2b12fd4ad07fc8df7e68cf) | fix | **list:** tokenize space around leading icon |
| [0d88889452](https://github.com/angular/components/commit/0d888894525801fd45e673e37557dc58cef44934) | fix | **list:** use direction-agnostic text-align |
| [46fe83f21f](https://github.com/angular/components/commit/46fe83f21f4f7cb54b09603829ddc4985a2e8be5) | fix | **list:** use transparent background for M3 ([#28504](https://github.com/angular/components/pull/28504)) |
| [044c9ba648](https://github.com/angular/components/commit/044c9ba6480cc80e2ab0e9a5d45a15c3b5c06174) | fix | **menu:** prevent icon from collapsing when text is long ([#28541](https://github.com/angular/components/pull/28541)) |
| [47c55925c0](https://github.com/angular/components/commit/47c55925c0eb9ff9b6a64446577ff322c01f03dc) | fix | **menu:** Update token values and styles for M3 ([#28470](https://github.com/angular/components/pull/28470)) |
| [a656164255](https://github.com/angular/components/commit/a656164255a276a0fdef4162a7e529426e0aae1d) | fix | **progress-bar:** incorrect alignment if direction is set on element |
| [f6d3f1bc21](https://github.com/angular/components/commit/f6d3f1bc21e0ee734432f0609f0ea17016cfdbe1) | fix | **schematics:** import async animations and remove deprecated function usages ([#28424](https://github.com/angular/components/pull/28424)) |
| [fbf2ef3fcb](https://github.com/angular/components/commit/fbf2ef3fcba5266188e530e77ee91f8f1d4ff7dd) | fix | **select:** fix m3 arrow alignment ([#28545](https://github.com/angular/components/pull/28545)) |
| [fca43aa49b](https://github.com/angular/components/commit/fca43aa49b060e77d27b9286740c9535b4ae42c2) | fix | **select:** styles for m3 ([#28492](https://github.com/angular/components/pull/28492)) |
| [d799c044a7](https://github.com/angular/components/commit/d799c044a7acffcf94a9d86cc304a2fd3ace1961) | fix | **slide-toggle:** fix m3 slide-toggle handle ([#28503](https://github.com/angular/components/pull/28503)) |
| [130afedf1c](https://github.com/angular/components/commit/130afedf1c823c2d24eda2bedd1ebe5e3b33e6fa) | fix | **slide-toggle:** m3 slide-toggle track ([#28539](https://github.com/angular/components/pull/28539)) |
| [63c6b841b4](https://github.com/angular/components/commit/63c6b841b43ba1b4efd8ec9a00305833cd5c5498) | fix | **slide-toggle:** m3 track outline and handle opacity ([#28565](https://github.com/angular/components/pull/28565)) |
| [2455a42d3c](https://github.com/angular/components/commit/2455a42d3c5866e122421f144f08ae6fa4df4198) | fix | **stepper:** Update token values for M3 and add color variant support ([#28430](https://github.com/angular/components/pull/28430)) |
| [f9621a7c8c](https://github.com/angular/components/commit/f9621a7c8c4bf96c12003e2c092b79c76b023efc) | fix | **tabs:** prevent page scroll on space press ([#28532](https://github.com/angular/components/pull/28532)) |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [d16e8ac5de](https://github.com/angular/components/commit/d16e8ac5de0191da06089e5668067c8d6e608d61) | feat | **theming:** add M3 tokens for pseudo checkbox ([#28407](https://github.com/angular/components/pull/28407)) |
| [4742a175ab](https://github.com/angular/components/commit/4742a175ab3b971aae9b6f6ad87a2cafd3257eb9) | fix | **theming:** Add more tests for M3 theme tokens ([#28561](https://github.com/angular/components/pull/28561)) |
| [1f1dac5e57](https://github.com/angular/components/commit/1f1dac5e57019d5faf044875c1b10be8e0fb1dd1) | fix | **theming:** Add support for color variants in badge, button-toggle, button, pseudo-checkbox, and chips ([#28457](https://github.com/angular/components/pull/28457)) |
| [08c97ab648](https://github.com/angular/components/commit/08c97ab648245d5369e0d3164e0b05c1abc9d193) | fix | **theming:** Add support for color variants in option, checkbox, and fab ([#28412](https://github.com/angular/components/pull/28412)) |
| [715877a13d](https://github.com/angular/components/commit/715877a13d8f60af3a1f26bf9f6a5f0cc2aee0ee) | fix | **theming:** Add support for color variants in progress-spiner, progress-bar, list, form-field, and datepicker ([#28451](https://github.com/angular/components/pull/28451)) |
| [29a1e5d8a1](https://github.com/angular/components/commit/29a1e5d8a13e1e81b9aa2e1dd89d54fb063fc191) | fix | **theming:** Add support for color variants in slide-toggle, select, and radio ([#28445](https://github.com/angular/components/pull/28445)) |
| [e45e210055](https://github.com/angular/components/commit/e45e210055eff26bd74956560b10f2681d4f2ac6) | fix | **theming:** Add support for color variants in tabs and slider ([#28417](https://github.com/angular/components/pull/28417)) |
| [9ab104b804](https://github.com/angular/components/commit/9ab104b8041ad6bd3f7529a88a6bdefcc219248a) | fix | **theming:** align dialog with M3 |
| [957bc487bf](https://github.com/angular/components/commit/957bc487bf8077cd4b657baa3d4ed64aebff9196) | fix | **theming:** align fab with M3 spec |
| [ba3680ed48](https://github.com/angular/components/commit/ba3680ed489e36c106578f790459084649e74bd0) | fix | **theming:** align M3 icon buttons with spec |
| [601a745fc8](https://github.com/angular/components/commit/601a745fc8e19ab7be93379297ea5fef58d5327e) | fix | **theming:** cap icon button size |
| [339905c5af](https://github.com/angular/components/commit/339905c5af8a0abe632c2abcdc9f19e9a480677e) | fix | **theming:** disabled radio button incorrect label color ([#28415](https://github.com/angular/components/pull/28415)) |
| [b6e0b20e1f](https://github.com/angular/components/commit/b6e0b20e1f72f48622179f0a8859b76df056b484) | fix | **theming:** Fix chip trailing icon opacity in M3 ([#28530](https://github.com/angular/components/pull/28530)) |
| [fdd16e6675](https://github.com/angular/components/commit/fdd16e667550690d554bba49888bfc6929bc97b2) | fix | **theming:** fix filled text field |
| [06c81e38c7](https://github.com/angular/components/commit/06c81e38c719b7b051aeae2ef339b904cc45015e) | fix | **theming:** fix paginator in M3 |
| [59b93b44ab](https://github.com/angular/components/commit/59b93b44ab807a55ce182599e30dc52609debaf8) | fix | **theming:** Fix token causing test failure on CI ([#28569](https://github.com/angular/components/pull/28569)) |
| [1e48cd431f](https://github.com/angular/components/commit/1e48cd431fb11f0e0172251d719340b2bc9aa39b) | fix | **theming:** fix up M3 checkbox |
| [056e2221ec](https://github.com/angular/components/commit/056e2221ecfd75808c74e2ef9a783bcb82a25c03) | fix | **theming:** implement M3 badge ([#28460](https://github.com/angular/components/pull/28460)) |
| [93f3421538](https://github.com/angular/components/commit/93f3421538118ef9187c2bcd4a2aec24a8fcfc01) | fix | **theming:** incorrect track color for alternate progress bar palettes ([#28484](https://github.com/angular/components/pull/28484)) |
| [935eda0872](https://github.com/angular/components/commit/935eda0872ffdafbf0273b931d6df04e49030369) | fix | **theming:** incorrect validation for density scale |
| [8fab89229d](https://github.com/angular/components/commit/8fab89229d3aad9109c5a22244f9f35ae3fc675f) | fix | **theming:** Make color API back-cmpat styles available ([#28526](https://github.com/angular/components/pull/28526)) |
| [f1deb30a17](https://github.com/angular/components/commit/f1deb30a1768ac6a5e87872a1b790f1b93b5b2c7) | fix | **theming:** Make M3 work with typography-hierarchy ([#28540](https://github.com/angular/components/pull/28540)) |
| [5f1a7ea1ee](https://github.com/angular/components/commit/5f1a7ea1ee6eecc5b4e2b3fd52445e5adb5911a6) | fix | **theming:** resolve M3 issues in mat-option ([#28482](https://github.com/angular/components/pull/28482)) |
| [dabb96765a](https://github.com/angular/components/commit/dabb96765a80c29067d07240d46d7852fbc580fa) | fix | **theming:** set up core theme and app tokens ([#28431](https://github.com/angular/components/pull/28431)) |
| [d26a51e3a5](https://github.com/angular/components/commit/d26a51e3a54b71928bc98df175c54997f8a31929) | fix | **theming:** set up internal form field in M3 ([#28414](https://github.com/angular/components/pull/28414)) |
| [42f2cc9ad8](https://github.com/angular/components/commit/42f2cc9ad8a2a4f2e38531cb299ef7f89e104d92) | fix | **theming:** set up padding tokens |
| [0da585f730](https://github.com/angular/components/commit/0da585f7307ea98b5575d520d3b6da79769827c4) | fix | **theming:** Update color palettes ([#28472](https://github.com/angular/components/pull/28472)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.14"></a>
# 16.2.14 "silky-schematic" (2024-02-01)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [8baf8d5aa](https://github.com/angular/components/commit/8baf8d5aa372462e985a3874d85f32f1d8987d00) | fix | **schematics:** schema error in mdc migration ([#28520](https://github.com/angular/components/pull/28520)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.2"></a>
# 17.1.2 "acrylic-aquarium" (2024-01-31)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [8675ae2436](https://github.com/angular/components/commit/8675ae24368dbf904176f1813ed0d8945e145fa5) | fix | **form-field:** insufficient color contrast text to input fill ([#28274](https://github.com/angular/components/pull/28274)) |
| [b6a9ac8214](https://github.com/angular/components/commit/b6a9ac8214a19b31776e73d56c811663c712b1e3) | fix | **schematics:** import async animations and remove deprecated function usages ([#28481](https://github.com/angular/components/pull/28481)) |
| [251293f950](https://github.com/angular/components/commit/251293f9502d8dbe39a3dc2c2399082ffeea2d49) | fix | **slide-toggle:** Emit token values under current selector or root ([#28390](https://github.com/angular/components/pull/28390)) |
| [9e02a1135b](https://github.com/angular/components/commit/9e02a1135bd108a3443e796f6c19385bce963495) | fix | **slider:** error if slider is destroyed before first change detection ([#28494](https://github.com/angular/components/pull/28494)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.1"></a>
# 17.1.1 "plastic-mug" (2024-01-25)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [739b841bbc](https://github.com/angular/components/commit/739b841bbc478c1f393d2945cc40c9fc216cf211) | fix | **badge:** move structural styles out of theme ([#28452](https://github.com/angular/components/pull/28452)) |
| [9e7fe24494](https://github.com/angular/components/commit/9e7fe24494add34341062ab9ba3fd1160adc3830) | fix | **core:** fix mat-error not rendering with Closure Compiler ([#28405](https://github.com/angular/components/pull/28405)) |
| [90456b0d4c](https://github.com/angular/components/commit/90456b0d4c0acf1eab096509a9e68b7472a0cc62) | fix | **dialog:** scale animation not working ([#28449](https://github.com/angular/components/pull/28449)) |
| [ed0a7aaa43](https://github.com/angular/components/commit/ed0a7aaa4379c18afde630518aa366beb5cd2317) | fix | **slide-toggle:** move state-layer-size token ([#28397](https://github.com/angular/components/pull/28397)) |
| [ab2ceab21c](https://github.com/angular/components/commit/ab2ceab21c7e2c4508c21280b261bcaec4cc627b) | fix | **slide-toggle:** use css var for disabled label color ([#28471](https://github.com/angular/components/pull/28471)) |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [d7f26c3342](https://github.com/angular/components/commit/d7f26c334288caecc86c378214282fbae8c46465) | fix | **theming:** align form field icons with M3 ([#28463](https://github.com/angular/components/pull/28463)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [4c83ea8ef8](https://github.com/angular/components/commit/4c83ea8ef830d9a409f72c09a27d7a6069928558) | fix | import ANIMATION_MODULE_TYPE from core ([#28459](https://github.com/angular/components/pull/28459)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.0"></a>
# 17.1.0 "metal-table" (2024-01-17)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [46eb9321cc](https://github.com/angular/components/commit/46eb9321cc522aaf55c9473ed5eed8af2548abb6) | fix | **table:** _cellRole lint error ([#28391](https://github.com/angular/components/pull/28391)) |
| [d3e8a28389](https://github.com/angular/components/commit/d3e8a28389dd77b865feaef0160911fd2c41f496) | fix | **table:** measuring sticky row too early ([#28393](https://github.com/angular/components/pull/28393)) |
| [30f0705491](https://github.com/angular/components/commit/30f07054913ff1026b0ec8420cd217ccc8daa167) | fix | **table:** support hydration ([#28356](https://github.com/angular/components/pull/28356)) |
| [1fe1f69303](https://github.com/angular/components/commit/1fe1f69303780c11c07ff84313f5fdc10440d55b) | perf | **table:** Optimize a11y role logic in CdkCell. ([#28336](https://github.com/angular/components/pull/28336)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [f23d8c1f7e](https://github.com/angular/components/commit/f23d8c1f7e828cc1d4d9d08cd6117507f979fcb5) | feat | **button:** add the ability to interact with disabled buttons ([#28242](https://github.com/angular/components/pull/28242)) |
| [6719168192](https://github.com/angular/components/commit/67191681921550b7e4e0c587880e4db25686c589) | feat | **chips:** expose _chipGrid in MatChipInput and add a stream of chip removal events ([#28012](https://github.com/angular/components/pull/28012)) ([#28013](https://github.com/angular/components/pull/28013)) |
| [556eeb19c8](https://github.com/angular/components/commit/556eeb19c8d53e8675df12670f5ccaa6148d2532) | fix | **button:** Move unthemable icon button tokens to theme mixin ([#27570](https://github.com/angular/components/pull/27570)) |
| [714eac3be4](https://github.com/angular/components/commit/714eac3be477768b482b0cf48ed2061b10d1a858) | fix | **button:** remove duplicate typography styles from FAB ([#28258](https://github.com/angular/components/pull/28258)) |
| [2dc10daa07](https://github.com/angular/components/commit/2dc10daa07a9380c61c955edd44005f2c06e5e22) | fix | **button:** use tokens for button elevation ([#28396](https://github.com/angular/components/pull/28396)) |
| [ec86cf88ee](https://github.com/angular/components/commit/ec86cf88ee8def16b906a893245fe564db9b0b33) | fix | **checkbox:** move required validation into component |
| [c00c2db924](https://github.com/angular/components/commit/c00c2db9242f0ea1933af2113f03535f8f75b2f2) | fix | **datepicker:** unable to distinguish disabled buttons in the calendar ([#28385](https://github.com/angular/components/pull/28385)) |
| [fef66fee7c](https://github.com/angular/components/commit/fef66fee7cca3829a0b756f57800e88624c597a2) | fix | **dialog:** `mat-dialog-title` should work under `OnPush` `viewContainerRef` ([#28329](https://github.com/angular/components/pull/28329)) |
| [9e43890155](https://github.com/angular/components/commit/9e438901555eaedc6617dd241ffabe391cba3b64) | fix | **form-field:** work around closure compiler issue ([#28185](https://github.com/angular/components/pull/28185)) |
| [4d0719a6a0](https://github.com/angular/components/commit/4d0719a6a0d0472ee1729750100167d9941b1641) | fix | **paginator:** match visual and reading order ([#28285](https://github.com/angular/components/pull/28285)) |
| [00e70fd8e3](https://github.com/angular/components/commit/00e70fd8e3542cc7a64c555a84f8092016c5236e) | fix | **slide-toggle:** delete custom typography tokens ([#28365](https://github.com/angular/components/pull/28365)) |
| [c2c818ceeb](https://github.com/angular/components/commit/c2c818ceeb3231128e4ec3d7b9a67b5460368230) | fix | **slide-toggle:** move required validation into component |
| [6bfbe9b19f](https://github.com/angular/components/commit/6bfbe9b19f9d277401f0ac7041e6a658db6a2e8e) | fix | **slider:** update inactive input width on value change ([#28275](https://github.com/angular/components/pull/28275)) |
| [a643a2ed42](https://github.com/angular/components/commit/a643a2ed42b7751087c59ff55a61c7e14f262604) | fix | **snack-bar:** Ensure snackbar open animation works with OnPush ancestor ([#28331](https://github.com/angular/components/pull/28331)) |
| [7f601b0936](https://github.com/angular/components/commit/7f601b093683c4519a79447bec3d8faf896c9e6e) | fix | **stepper:** enable hydration ([#28382](https://github.com/angular/components/pull/28382)) |
| [a7f87a80a1](https://github.com/angular/components/commit/a7f87a80a18a62d75a8c5621fd89dbc2cf28a865) | fix | **tabs:** enable hydration ([#28366](https://github.com/angular/components/pull/28366)) |
### google-maps
| Commit | Type | Description |
| -- | -- | -- |
| [9f1989228f](https://github.com/angular/components/commit/9f1989228f10694b61e694db456c387687e9626d) | feat | add support for dynamic library loading API |
| [338aa184ae](https://github.com/angular/components/commit/338aa184aee83c2b7c450c7272897e4417bccb79) | fix | error when added through ng add |
### youtube-player
| Commit | Type | Description |
| -- | -- | -- |
| [e0414b19c1](https://github.com/angular/components/commit/e0414b19c132ecdd26b49b133e323f80960f1159) | feat | automatically load youtube api |
| [381a65f33d](https://github.com/angular/components/commit/381a65f33d87c885235d2076297f092d6c218bae) | feat | coerce inputs |
| [b7c47c3025](https://github.com/angular/components/commit/b7c47c3025d430c738175f0e7e84d37c6311d8fd) | feat | improve initial load performance using a placeholder image ([#28207](https://github.com/angular/components/pull/28207)) |
| [62ca3ede70](https://github.com/angular/components/commit/62ca3ede70bb87e212fcf5f88b1e9cb8a1660d92) | fix | error when added through ng add |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [244bed4675](https://github.com/angular/components/commit/244bed467505b618a38e62c7dc4ca9b67ac431b0) | feat | **theming:** add M3 button tokens ([#28375](https://github.com/angular/components/pull/28375)) |
| [cf6ab1c1d0](https://github.com/angular/components/commit/cf6ab1c1d0a30c1a77efe878d1f15bb4207ec31e) | feat | **theming:** add M3 expansion support ([#28159](https://github.com/angular/components/pull/28159)) |
| [2963b7aaca](https://github.com/angular/components/commit/2963b7aaca3d91fe62f592707ca764f818a5877e) | feat | **theming:** add M3 icon-button & fab support ([#28157](https://github.com/angular/components/pull/28157)) |
| [0b7e656f19](https://github.com/angular/components/commit/0b7e656f192002b7ea025aef68404e76f733be12) | feat | **theming:** Add support for color variants ([#28279](https://github.com/angular/components/pull/28279)) |
| [94d8997b2c](https://github.com/angular/components/commit/94d8997b2c10116bfe711b004af8ccfc82e012f3) | fix | **theming:** fix border radius of filled form field |
| [d1ceb6b44a](https://github.com/angular/components/commit/d1ceb6b44aa65652f9a8d301554a41d21c3b01f1) | fix | **theming:** fix disabled form field in M3 |
### material-moment-adapter
| Commit | Type | Description |
| -- | -- | -- |
| [eca50162a7](https://github.com/angular/components/commit/eca50162a7d3367f2028fcaa75f9b08e58109f8b) | fix | error when added through ng add |
### material-luxon-adapter
| Commit | Type | Description |
| -- | -- | -- |
| [91b646717d](https://github.com/angular/components/commit/91b646717d9836215ff839fafcf148ded677006e) | fix | error when added through ng add |
### material-date-fns-adapter
| Commit | Type | Description |
| -- | -- | -- |
| [083472db0e](https://github.com/angular/components/commit/083472db0e52b5a0127d2c746a8f44061763de51) | feat | support date-fns 3.0 ([#28364](https://github.com/angular/components/pull/28364)) |
| [2da9f6bc32](https://github.com/angular/components/commit/2da9f6bc32d48fcb72d447e665ce592114aa1cf5) | fix | error when added through ng add |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [997bf75f9f](https://github.com/angular/components/commit/997bf75f9fb20c4b67f02c94baf128edd7eb007c) | fix | consolidate and tokenize internal form field ([#28236](https://github.com/angular/components/pull/28236)) |
| [7840cd3a77](https://github.com/angular/components/commit/7840cd3a779b6e7388971e279bd60de2bcb1e89b) | fix | provide standalone-friendly APIs for date adapters ([#28349](https://github.com/angular/components/pull/28349)) |
| [21737ad394](https://github.com/angular/components/commit/21737ad394a404881193ad89edfe29fe3ec8235e) | fix | use provide functions in providers for date adapters ([#28363](https://github.com/angular/components/pull/28363)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.6"></a>
# 17.0.6 "plastic-spoon" (2024-01-17)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [53aae488ff](https://github.com/angular/components/commit/53aae488ff77fecd6dab1f15151938c1a2968f80) | fix | **progress-bar:** remove track color workaround ([#28416](https://github.com/angular/components/pull/28416)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.13"></a>
# 16.2.13 "pink-peach" (2024-01-11)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [398197d7e](https://github.com/angular/components/commit/398197d7e7596d1a6526a0be47a1eb1305e0bc1c) | fix | **button:** resolve memory leaks in ripples ([#28254](https://github.com/angular/components/pull/28254)) ([#28408](https://github.com/angular/components/pull/28408)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.5"></a>
# 17.0.5 "stardust-symphony" (2024-01-10)
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [5e2d13b912](https://github.com/angular/components/commit/5e2d13b9128da3d78259fe49abd1200af7ec3947) | fix | **a11y:** resolve hydration error in focus trap |
| [837d396aff](https://github.com/angular/components/commit/837d396aff79e4cd8f3dbbbc15342050e9ba1bc2) | fix | **collections:** Do not deselect comparable already selected value with setSelection ([#28267](https://github.com/angular/components/pull/28267)) |
| [94a9fa9c6c](https://github.com/angular/components/commit/94a9fa9c6cd31bb82d3b0367aec5c13d54b18802) | fix | **dialog:** resolve hydration error in focus trap |
| [82c37a9774](https://github.com/angular/components/commit/82c37a97741e0d3d27c6922894978596cc51539d) | fix | **drag-drop:** auto-scroll to the left not starting in rtl layout ([#28334](https://github.com/angular/components/pull/28334)) |
| [a75bb7ad87](https://github.com/angular/components/commit/a75bb7ad8749a6c56cdcfbc1685436b99ee18ece) | perf | **a11y:** Micro-optimizations to aria-reference.ts. ([#28337](https://github.com/angular/components/pull/28337)) |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [2852c3f7a4](https://github.com/angular/components/commit/2852c3f7a4e41b5c7804596fa5e20b387ccfb26b) | fix | **autocomplete:** not closing when clicking on hint area ([#28316](https://github.com/angular/components/pull/28316)) |
| [4eb24cfdaf](https://github.com/angular/components/commit/4eb24cfdafb67d4834a78cfc73ec04e9a4acf16c) | fix | **schematics:** resolve errors in dashboard schematic |
| [6feb26d107](https://github.com/angular/components/commit/6feb26d10701a841f45545d42bd29e873120a131) | fix | **schematics:** schema error in mdc migration ([#28342](https://github.com/angular/components/pull/28342)) |
| [3500908ca6](https://github.com/angular/components/commit/3500908ca609aa4d2110513ea20fbaff475b78a9) | fix | **schematics:** use single style and styleUrl in generated code |
| [65331e2aa8](https://github.com/angular/components/commit/65331e2aa872cbe00c784a24724586a521aae2a6) | fix | **select:** flicker if opened from inside a focus handler ([#28287](https://github.com/angular/components/pull/28287)) |
| [7076f96a09](https://github.com/angular/components/commit/7076f96a09252b54f8d5399e00f74f76e345b3ab) | fix | **sidenav:** enable hydration |
| [27a09a5f57](https://github.com/angular/components/commit/27a09a5f57e377bf0315310d190a457aa1c7a0af) | fix | **slider:** fix internal focus state on safari ([#28243](https://github.com/angular/components/pull/28243)) |
| [766d1d8f85](https://github.com/angular/components/commit/766d1d8f85ebb55f0901658fa1bbf543fc5d6fb5) | fix | **slider:** fix value indicator bubble for m3 ([#28250](https://github.com/angular/components/pull/28250)) |
| [1d9d11325c](https://github.com/angular/components/commit/1d9d11325cd7100b898e889ac7386195e9d5292e) | fix | **slider:** m3 ripple color ([#28369](https://github.com/angular/components/pull/28369)) |
| [e97d98b037](https://github.com/angular/components/commit/e97d98b037b7903d4d14986e8aa940d5d4ca3f01) | fix | **slider:** slider tx imprecision ([#28283](https://github.com/angular/components/pull/28283)) |
| [cbfdc060b4](https://github.com/angular/components/commit/cbfdc060b415d43dce3a2a69cc425436b5043c36) | fix | **theming:** Expose the `theme-remove` Sass function ([#28314](https://github.com/angular/components/pull/28314)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [ddbc022843](https://github.com/angular/components/commit/ddbc0228433bc63768468924dfcb3efe4435aab8) | fix | enable hydration in autocomplete, menu and select ([#28343](https://github.com/angular/components/pull/28343)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.4"></a>
# 17.0.4 "hematite-house" (2023-12-13)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [9596dccbf](https://github.com/angular/components/commit/9596dccbf4bbc73b0918db4afa1434d9742d0411) | fix | **button:** resolve memory leaks in ripples ([#28254](https://github.com/angular/components/pull/28254)) |
| [7b183b259](https://github.com/angular/components/commit/7b183b259aab6bcabb36edb924fb45078dc4d071) | fix | **chips:** enable hydration ([#28260](https://github.com/angular/components/pull/28260)) |
| [fbcd237e5](https://github.com/angular/components/commit/fbcd237e52c5ae0f20c18d672d90b06153888302) | fix | **tabs:** add header divider for m3 ([#28244](https://github.com/angular/components/pull/28244)) |
| [ac77efd08](https://github.com/angular/components/commit/ac77efd082de220bf9d0d3a75b940e04d24eabbe) | fix | **tabs:** deprecate backgroundColor API ([#28262](https://github.com/angular/components/pull/28262)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [c0c6f6376](https://github.com/angular/components/commit/c0c6f6376b6857e621a203b3dc68bbec73a3bfce) | fix | add fallback root providers to injection tokens ([#28259](https://github.com/angular/components/pull/28259)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.3"></a>
# 17.0.3 "opal-kaleidoscope" (2023-12-07)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [e9519c3e73](https://github.com/angular/components/commit/e9519c3e73f3e064bfca62c9d7872dcf57aa60dc) | fix | **slider:** fix tick mark precision ([#28193](https://github.com/angular/components/pull/28193)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.2"></a>
# 17.0.2 "sand-salmon" (2023-12-01)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [4938722fa](https://github.com/angular/components/commit/4938722fafed08babd108a51736b1a714ca72a70) | fix | **autocomplete:** clear selected option if it is removed while typing ([#28146](https://github.com/angular/components/pull/28146)) |
| [381037818](https://github.com/angular/components/commit/38103781893fc234777aa4dc15965c0efab06ae1) | fix | **button:** fix flat button line-height ([#28090](https://github.com/angular/components/pull/28090)) |
| [5f789f79d](https://github.com/angular/components/commit/5f789f79db85c42d4f69a051cb0031090d141ccb) | fix | **button:** fix outlined button line-height ([#28092](https://github.com/angular/components/pull/28092)) |
| [d45f4967a](https://github.com/angular/components/commit/d45f4967a4aa8dac6e122c4213fc38f75b561125) | fix | **button:** fix text button line-height ([#28091](https://github.com/angular/components/pull/28091)) |
| [04ceccf21](https://github.com/angular/components/commit/04ceccf21da00e04869270fd0579539ddde8ddd4) | fix | **core:** prevent ng update schematic from checking node_modules ([#28152](https://github.com/angular/components/pull/28152)) |
| [c2a812967](https://github.com/angular/components/commit/c2a812967ccabd2d4012eb8e079df9f0bd3f2e14) | fix | **tooltip:** increase specificity of non-interactive styles ([#28180](https://github.com/angular/components/pull/28180)) |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [3d118c67a](https://github.com/angular/components/commit/3d118c67a56cd8cfeeb80a9701749e8e31e564c3) | feat | **theming:** add M3 autocomplete, badge, and bottom-sheet support ([#28177](https://github.com/angular/components/pull/28177)) |
| [950ca90b7](https://github.com/angular/components/commit/950ca90b7b73e0a22de512559f36e75554c48fc7) | feat | **theming:** add M3 button-toggle support ([#28179](https://github.com/angular/components/pull/28179)) |
| [ee6894f3e](https://github.com/angular/components/commit/ee6894f3e2f53b3923a571556581f001529b0396) | feat | **theming:** add M3 chips support ([#28183](https://github.com/angular/components/pull/28183)) |
| [86c55d004](https://github.com/angular/components/commit/86c55d0042e4a9d95df5a52a1fc5d7d13dabedaf) | feat | **theming:** add M3 datepicker support ([#28166](https://github.com/angular/components/pull/28166)) |
| [4424c0b21](https://github.com/angular/components/commit/4424c0b217838f947978adb65855e69d57ea8328) | feat | **theming:** add M3 dialog support ([#28163](https://github.com/angular/components/pull/28163)) |
| [61401f57a](https://github.com/angular/components/commit/61401f57a9219b8226bb0fa82cd487a301e7da64) | feat | **theming:** add M3 grid-list support ([#28131](https://github.com/angular/components/pull/28131)) |
| [cd0f36ac3](https://github.com/angular/components/commit/cd0f36ac3c6878e66c757d3d6b1cae05994fef0a) | feat | **theming:** add M3 icon support ([#28126](https://github.com/angular/components/pull/28126)) |
| [5bf3ab4b6](https://github.com/angular/components/commit/5bf3ab4b6b8c81361651a78357cc375e54922b89) | feat | **theming:** add M3 menu & divider support ([#28144](https://github.com/angular/components/pull/28144)) |
| [1abf88008](https://github.com/angular/components/commit/1abf88008a42f5427d8653883bf0f49361609df5) | feat | **theming:** add M3 paginator support ([#28164](https://github.com/angular/components/pull/28164)) |
| [750d95faa](https://github.com/angular/components/commit/750d95faa7a5960431d8199a0c301f14b6d7de50) | feat | **theming:** add M3 select, option, and optgroup support ([#28148](https://github.com/angular/components/pull/28148)) |
| [662bbb4b2](https://github.com/angular/components/commit/662bbb4b2c465a011d55a4b266ec7e2c2a818104) | feat | **theming:** add M3 sidenav support ([#28125](https://github.com/angular/components/pull/28125)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.1"></a>
# 17.0.1 "plastic-chicken" (2023-11-16)
### material
| Commit | Type | Description |
| -- | -- | -- |
| [df5e9c4f3f](https://github.com/angular/components/commit/df5e9c4f3f13ca9b89ea8fe0661f51a83cb635cd) | fix | **autocomplete:** clear previous selection on reactive form reset ([#27653](https://github.com/angular/components/pull/27653)) |
| [efc0dcfc4c](https://github.com/angular/components/commit/efc0dcfc4c330e6d119edf6bf37cd0225627932a) | fix | **autocomplete:** regression in requireSelection when options are filtered ([#28119](https://github.com/angular/components/pull/28119)) |
| [09c7eb4f8b](https://github.com/angular/components/commit/09c7eb4f8b0b3ddc8e8f0a1b71c704a414f66823) | fix | **button:** fix raised button line-height ([#28073](https://github.com/angular/components/pull/28073)) |
| [1a61fc7eea](https://github.com/angular/components/commit/1a61fc7eeaabfe843a5632e50b350b3b4503d85c) | fix | **datepicker:** Fix raw date value being compared ([#27896](https://github.com/angular/components/pull/27896)) |
| [fe339ee2ba](https://github.com/angular/components/commit/fe339ee2ba7b1afcc03cf1e56cec7c6cfade2ce4) | fix | **list:** validation using wrong variable ([#27638](https://github.com/angular/components/pull/27638)) |
| [a09ca60be8](https://github.com/angular/components/commit/a09ca60be80f49594d848efaef65629e63934c64) | fix | **schematics:** switch to new control flow ([#28106](https://github.com/angular/components/pull/28106)) |
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [cfe596ab1d](https://github.com/angular/components/commit/cfe596ab1d0c3816355f11cd966ea9d6619ee917) | feat | **theming:** add M3 form-field & input support ([#28121](https://github.com/angular/components/pull/28121)) |
| [365789bd0f](https://github.com/angular/components/commit/365789bd0f8c9fa13778891ec90e712a21216d29) | feat | **theming:** add M3 list support ([#28122](https://github.com/angular/components/pull/28122)) |
| [81a8cc77e8](https://github.com/angular/components/commit/81a8cc77e8c7a66eb40d598eb373ca0346015978) | feat | **theming:** add M3 slide-toggle support ([#28014](https://github.com/angular/components/pull/28014)) |
| [ac62b42742](https://github.com/angular/components/commit/ac62b42742ae6231bcff922da57f8d5df451bd33) | feat | **theming:** add M3 sort support ([#28105](https://github.com/angular/components/pull/28105)) |
| [c5e4766d0f](https://github.com/angular/components/commit/c5e4766d0f0d02c0c8d8a23e5e090e0e456bbe0b) | fix | **theming:** Update M3 palettes ([#28109](https://github.com/angular/components/pull/28109)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.0"></a>
# 17.0.0 "deferred-diamond" (2023-11-08)
## Breaking Changes
### material
- There are new styles emitted by `mat.<component>-theme` that are not emitted by
  any of: `mat.<component>-color`, `mat.<component>-typography`, or
  `mat.<component>-density`. If you rely on the partial mixins only and don't call
  `mat.<component>-theme`, you can add `mat.<component>-base` to get the missing
  styles. Alternatively you can call `mat.all-component-bases` to get just the
  base styles for all components.
- There are new styles emitted by mat.bottom-sheet-theme that are not
  emitted by any of: mat.bottom-sheet-color, mat.bottom-sheet-typography,
  mat.bottom-sheet-density. If you rely on the partial mixins only and don't
  call mat.bottom-sheet-theme, you can add mat.bottom-sheet-base to get the
  missing styles.
- There are new styles emitted by mat.button-toggle-theme that are not
  emitted by any of: mat.button-toggle-color, mat.button-toggle-typography,
  mat.button-toggle-density. If you rely on the partial mixins only and don't
  call mat.button-toggle-theme, you can add mat.button-toggle-base to get the
  missing styles.
- There are new styles emitted by `mat.fab-theme` that are not
  emitted by any of: `mat.fab-color`, `mat.fab-typography`,
  `mat.fab-density`. If you rely on the partial mixins only and don't
  call `mat.fab-theme`, you can add `mat.fab-base` to get the
  missing styles.
- There are new styles emitted by `mat.card-theme` that are not
  emitted by any of: `mat.card-color`, `mat.card-typography`,
  `mat.card-density`. If you rely on the partial mixins only and don't
  call `mat.card-theme`, you can add `mat.card-base` to get the
  missing styles.
- There are new styles emitted by `mat.checkbox-theme` that are not
  emitted by any of: `mat.checkbox-color`, `mat.checkbox-typography`,
  `mat.checkbox-density`. If you rely on the partial mixins only and don't
  call `mat.checkbox-theme`, you can add `mat.checkbox-base` to get the
  missing styles.
- There are new styles emitted by mat.chips-theme that are not
  emitted by any of: mat.chips-color, mat.chips-typography,
  mat.chips-density. If you rely on the partial mixins only and don't
  call mat.chips-theme, you can add mat.chips-base to get the
  missing styles.
- `NativeDateAdapter` no longer takes `Platform` in its
  constructor. It also now uses the `inject` function, and therefore
  cannot be instantiated directly (must go through Angular's DI system
  instead).
- There are new styles emitted by `mat.dialog-theme` that are not
  emitted by any of: `mat.dialog-color`, `mat.dialog-typography`,
  `mat.dialog-density`. If you rely on the partial mixins only and don't
  call `mat.dialog-theme`, you can add `mat.dialog-base` to get the
  missing styles.
- There are new styles emitted by `mat.list-theme` that are not
  emitted by any of: `mat.list-color`, `mat.list-typography`,
  `mat.list-density`. If you rely on the partial mixins only and don't
  call `mat.list-theme`, you can add `mat.list-base` to get the
  missing styles.
- There are new styles emitted by mat.menu-theme that are not
  emitted by any of: mat.menu-color, mat.menu-typography,
  mat.menu-density. If you rely on the partial mixins only and don't
  call mat.menu-theme, you can add mat.menu-base to get the
  missing styles.
- There are new styles emitted by mat.progress-bar-theme that are not
  emitted by any of: mat.progress-bar-color, mat.progress-bar-typography,
  mat.progress-bar-density. If you rely on the partial mixins only and don't
  call mat.progress-bar-theme, you can add mat.progress-bar-base to get the
  missing styles.
- There are new styles emitted by mat.progress-spinner-theme that are not
  emitted by any of: mat.progress-spinner-color, mat.progress-spinner-typography,
  mat.progress-spinner-density. If you rely on the partial mixins only and don't
  call mat.progress-spinner-theme, you can add mat.progress-spinner-base to get the
  missing styles.
- There are new styles emitted by `mat.radio-theme` that are not
  emitted by any of: `mat.radio-color`, `mat.radio-typography`,
  `mat.radio-density`. If you rely on the partial mixins only and don't
  call `mat.radio-theme`, you can add `mat.radio-base` to get the
  missing styles.
- There are new styles emitted by mat.sidenav-theme that are not
  emitted by any of: mat.sidenav-color, mat.sidenav-typography,
  mat.sidenav-density. If you rely on the partial mixins only and don't
  call mat.sidenav-theme, you can add mat.sidenav-base to get the
  missing styles.
- There are new styles emitted by mat.slide-toggle-theme that are not
  emitted by any of: mat.slide-toggle-color, mat.slide-toggle-typography,
  mat.slide-toggle-density. If you rely on the partial mixins only and don't
  call mat.slide-toggle-theme, you can add mat.slide-toggle-base to get the
  missing styles.
- There are new styles emitted by `mat.slider-theme` that are not
  emitted by any of: `mat.slider-color`, `mat.slider-typography`,
  `mat.slider-density`. If you rely on the partial mixins only and don't
  call `mat.slider-theme`, you can add `mat.slider-base` to get the
  missing styles.
- There are new styles emitted by `mat.snack-bar-theme` that are not
  emitted by any of: `mat.snack-bar-color`, `mat.snack-bar-typography`,
  `mat.snack-bar-density`. If you rely on the partial mixins only and don't
  call `mat.snack-bar-theme`, you can add `mat.snack-bar-base` to get the
  missing styles.
- There are new styles emitted by mat.table-theme that are not
  emitted by any of: mat.table-color, mat.table-typography,
  mat.table-density. If you rely on the partial mixins only and don't
  call mat.table-theme, you can add mat.table-base to get the
  missing styles.
- There are new styles emitted by mat.tabs-theme that are not
  emitted by any of: mat.tabs-color, mat.tabs-typography,
  mat.tabs-density. If you rely on the partial mixins only and don't
  call mat.tabs-theme, you can add mat.tabs-base to get the
  missing styles.
- There are new styles emitted by mat.tooltip-theme that are not
  emitted by any of: mat.tooltip-color, mat.tooltip-typography,
  mat.tooltip-density. If you rely on the partial mixins only and don't
  call mat.tooltip-theme, you can add mat.tooltip-base to get the
  missing styles.
### multiple
- `@import` of Angular Material and Angular CDK Sass is no longer
  supported. Please use `@use` instead.
- - Themes are now more strictly validated when calling Angular Material
  theme mixins. For example, calling `mat.button-typography` with a theme
  has `typography: null` is now an error.
  - The `mat.legacy-typography-hierarchy` mixin has been removed in favor
    of `mat.typography-hierarchy`
### material-experimental
| Commit | Type | Description |
| -- | -- | -- |
| [289ddd348](https://github.com/angular/components/commit/289ddd348395f0299a6c7cba2cde8662842df06d) | feat | **theming:** add M3 progress bar support ([#27880](https://github.com/angular/components/pull/27880)) |
| [75029c273](https://github.com/angular/components/commit/75029c273a4aad3ad4481d8c045c9a73ccceb34e) | feat | **theming:** add M3 progress-spinner support ([#27868](https://github.com/angular/components/pull/27868)) |
| [2f958aced](https://github.com/angular/components/commit/2f958aced5757915f75e4036229d5df63f6ff414) | feat | **theming:** add M3 radio support ([#27867](https://github.com/angular/components/pull/27867)) |
| [fbc7bdda9](https://github.com/angular/components/commit/fbc7bdda93b7c261705da81cec6720bbf607c5ce) | feat | **theming:** add M3 slider support ([#27826](https://github.com/angular/components/pull/27826)) |
| [6b57edb1b](https://github.com/angular/components/commit/6b57edb1b164909f8aa1eddac87a915c037e6905) | feat | **theming:** add M3 snackbar support ([#27824](https://github.com/angular/components/pull/27824)) |
| [545db61b4](https://github.com/angular/components/commit/545db61b41957df26c5e3c95a2959ca6c83a9190) | feat | **theming:** add M3 toolbar support ([#27812](https://github.com/angular/components/pull/27812)) |
| [1930b1dac](https://github.com/angular/components/commit/1930b1dacf07826750ffc72dbce551fe6653fd4f) | feat | **theming:** add M3 tooltip support ([#27810](https://github.com/angular/components/pull/27810)) |
| [60aa52c88](https://github.com/angular/components/commit/60aa52c88670307365890071df9e16645024653b) | feat | **theming:** Support defining M3 theme objects |
### material
| Commit | Type | Description |
| -- | -- | -- |
| [06559a012](https://github.com/angular/components/commit/06559a0129d0432542513f1160ab5837a4ce4af5) | feat | **dialog:** switch to standalone ([#27860](https://github.com/angular/components/pull/27860)) |
| [425bad872](https://github.com/angular/components/commit/425bad872dcdd56b8f6b4dcf23627ca58e402a05) | feat | **snack-bar:** convert to standalone ([#27926](https://github.com/angular/components/pull/27926)) |
| [7be5dde24](https://github.com/angular/components/commit/7be5dde24e46ca889b31b307c2eda6d6f0faab56) | feat | **theming:** Add 'base' theming dimension to all components ([#27924](https://github.com/angular/components/pull/27924)) |
| [9906aa344](https://github.com/angular/components/commit/9906aa3443ad874c7470c94fea137c72779c9fcd) | feat | **theming:** Add APIs to check what information theme has |
| [1a85dd299](https://github.com/angular/components/commit/1a85dd299b4ac38d201c3cc38c396b2f08398adc) | feat | **theming:** Add APIs to get color info from theme |
| [e608f5fa3](https://github.com/angular/components/commit/e608f5fa392e9a5cd80923ba545b66217ad01c30) | feat | **theming:** Add APIs to get density info from theme |
| [f52e97958](https://github.com/angular/components/commit/f52e97958ac8d9845017a5ead077952f3228144f) | feat | **theming:** Add APIs to get typography info from theme |
| [685b585f7](https://github.com/angular/components/commit/685b585f70fded62813480b849832fd1bfd1bffb) | feat | **theming:** add support for M2 themes to theme inspection API |
| [82844b3d5](https://github.com/angular/components/commit/82844b3d52235f67119eb5f0fe4e5c56474440c3) | feat | **theming:** Open up new APIs to access theme values ([#27865](https://github.com/angular/components/pull/27865)) |
| [c6bc738cd](https://github.com/angular/components/commit/c6bc738cd1d7ca3c5d468f91252cfb8619a17b01) | fix | **bottom-sheet:** move unthemable tokens to theme mixin ([#27882](https://github.com/angular/components/pull/27882)) |
| [bcbdf910b](https://github.com/angular/components/commit/bcbdf910b11c0d828faab2ff99d12f92970b636d) | fix | **button-toggle:** move unthemable tokens to theme mixin ([#27883](https://github.com/angular/components/pull/27883)) |
| [74d1be62e](https://github.com/angular/components/commit/74d1be62e2940e123aa38e1b645815fbd3eca8a9) | fix | **button:** align prefixes with MDC ([#27936](https://github.com/angular/components/pull/27936)) |
| [146bc2385](https://github.com/angular/components/commit/146bc23859475a778656106f7a3d656df56051d0) | fix | **button:** Emit fab tokens under mixin root selector ([#27806](https://github.com/angular/components/pull/27806)) |
| [1de6a3aa3](https://github.com/angular/components/commit/1de6a3aa37118e4153fb995a8c8f4daecdf6d0b5) | fix | **button:** fix color tokens of raised buttons ([#27904](https://github.com/angular/components/pull/27904)) |
| [68096ec9d](https://github.com/angular/components/commit/68096ec9d34aae793a7b3037c39e6ae7d1700933) | fix | **button:** Move fab unthemable tokens to theme mixin ([#27580](https://github.com/angular/components/pull/27580)) |
| [408c0b492](https://github.com/angular/components/commit/408c0b492f5d7edd6571b2287bb06aa89d582758) | fix | **card:** Apply tokens at mixin root ([#27557](https://github.com/angular/components/pull/27557)) |
| [06460d177](https://github.com/angular/components/commit/06460d17703ef28a8fc89833c389c479b1ba6bcf) | fix | **card:** Move unthemable tokens to theme mixin ([#27579](https://github.com/angular/components/pull/27579)) |
| [03a773a02](https://github.com/angular/components/commit/03a773a0237843fd1e1e600d0b9911eb924319bc) | fix | **checkbox:** Move unthemable tokens to theme mixin ([#27556](https://github.com/angular/components/pull/27556)) |
| [f823c2a52](https://github.com/angular/components/commit/f823c2a52a4eed29d2a71c8d94790107231cc139) | fix | **chips:** move unthemable tokens to theme mixin ([#27884](https://github.com/angular/components/pull/27884)) |
| [fcaa95e69](https://github.com/angular/components/commit/fcaa95e6955d05773037650f48eb50efc445b24c) | fix | **core:** prevent updates to v17 if project uses legacy components ([#28024](https://github.com/angular/components/pull/28024)) |
| [b423c0e0b](https://github.com/angular/components/commit/b423c0e0b754b1f1d118d17e022981c357c3aa68) | fix | **datepicker:** deprecate constructor injection in NativeDateAdapter ([#26144](https://github.com/angular/components/pull/26144)) |
| [cac7a41f7](https://github.com/angular/components/commit/cac7a41f7b7a6034d8049be77fe53a082c3aa5f2) | fix | **dialog:** css structure change ([#27510](https://github.com/angular/components/pull/27510)) |
| [6f0a4655e](https://github.com/angular/components/commit/6f0a4655e8a3df9621a3c888308c7ba75c27b81c) | fix | **dialog:** Emit tokens under mixin root selector ([#27830](https://github.com/angular/components/pull/27830)) |
| [c4a62a884](https://github.com/angular/components/commit/c4a62a884f9eabeacdfd299a91deccc9003fc34c) | fix | **dialog:** MatDialog: change member _dialog (cdk) from private to protected ([#28019](https://github.com/angular/components/pull/28019)) ([#28020](https://github.com/angular/components/pull/28020)) |
| [dfba0edfb](https://github.com/angular/components/commit/dfba0edfbec52614e42e6fe0f9409a1fa0346669) | fix | **dialog:** Move unthemable tokens to theme mixin ([#27606](https://github.com/angular/components/pull/27606)) |
| [c6fa905dd](https://github.com/angular/components/commit/c6fa905dd489b7a1b66c8a91efd68cdc07efed86) | fix | **divider:** move unthemable tokens to theme mixin ([#27881](https://github.com/angular/components/pull/27881)) |
| [afceed2a5](https://github.com/angular/components/commit/afceed2a563b9931097a72f1da12896e49fa6fe3) | fix | **expansion:** move unthemable tokens to theme mixin ([#27885](https://github.com/angular/components/pull/27885)) |
| [cf456a2d4](https://github.com/angular/components/commit/cf456a2d43837497367662e7de22f1b2bcbf4f00) | fix | **form-field:** don't toggle hover state over subscript ([#27683](https://github.com/angular/components/pull/27683)) |
| [0ac19114c](https://github.com/angular/components/commit/0ac19114cdcbd2c874c7d93ef8b9234d0a42d0ce) | fix | **form-field:** move unthemable tokens to theme mixin ([#27887](https://github.com/angular/components/pull/27887)) |
| [c7db4960e](https://github.com/angular/components/commit/c7db4960e16d0f74b0764cfa5be752392e8c30f6) | fix | **list:** Emit tokens under mixin root selector ([#27711](https://github.com/angular/components/pull/27711)) |
| [7c16cc8b6](https://github.com/angular/components/commit/7c16cc8b659133167f1b875dcfe77ca806bfe876) | fix | **list:** Move unthemable tokens to theme mixin ([#27607](https://github.com/angular/components/pull/27607)) |
| [c77ffa0cc](https://github.com/angular/components/commit/c77ffa0cc22b5e7ed08923d97bb049ce74d71888) | fix | **menu:** move unthemable tokens to theme mixin ([#27888](https://github.com/angular/components/pull/27888)) |
| [047404067](https://github.com/angular/components/commit/047404067865a2452bfcb93b2374ac07aca319be) | fix | **progress-bar:** Move unthemable tokens to theme mixin ([#27563](https://github.com/angular/components/pull/27563)) |
| [f8252d816](https://github.com/angular/components/commit/f8252d816806b4fff18bb5f7d313a8edca774459) | fix | **progress-spinner:** Emit tokens under mixin root selector ([#27594](https://github.com/angular/components/pull/27594)) |
| [593fc79ec](https://github.com/angular/components/commit/593fc79ecbc6677f04e2d3707bff024b00a517e8) | fix | **progress-spinner:** Move unthemable tokens to theme mixin ([#27567](https://github.com/angular/components/pull/27567)) |
| [dbd31dec8](https://github.com/angular/components/commit/dbd31dec882519aa23f8275c3987f1d00e6f8a4a) | fix | **radio:** Apply tokens at mixin root ([#27864](https://github.com/angular/components/pull/27864)) |
| [943b5dabf](https://github.com/angular/components/commit/943b5dabf3fc14cf0dee80174a6891fef8a588c8) | fix | **radio:** move unthemable tokens to theme mixin ([#27809](https://github.com/angular/components/pull/27809)) |
| [7a42a5de9](https://github.com/angular/components/commit/7a42a5de9888fcd2dc459c3887a167860d0726fd) | fix | **schematics:** account for browser-esbuild builder ([#28025](https://github.com/angular/components/pull/28025)) |
| [041a71b87](https://github.com/angular/components/commit/041a71b87a16a40de3307ed7bc9e97a6020d2433) | fix | **schematics:** Create a schematic to add the base theme dimension ([#27964](https://github.com/angular/components/pull/27964)) |
| [9fe4fe1f5](https://github.com/angular/components/commit/9fe4fe1f54f8dab72d4291e2dbee96dc8ade62b6) | fix | **schematics:** don't add the preconnect for fonts ([#28026](https://github.com/angular/components/pull/28026)) |
| [7cd71b697](https://github.com/angular/components/commit/7cd71b69799fa0cf4825ac2515fc29d26e2ecd47) | fix | **sidenav:** move unthemable tokens to theme mixin ([#27889](https://github.com/angular/components/pull/27889)) |
| [eed75ddfc](https://github.com/angular/components/commit/eed75ddfc794d36617008c7b3ebe4fcba4bef2ff) | fix | **slide-toggle:** move unthemable tokens to theme mixin ([#27905](https://github.com/angular/components/pull/27905)) |
| [b13c6aa19](https://github.com/angular/components/commit/b13c6aa194cf560a304213961ae28725f8d0a4e2) | fix | **slider:** change slider to use MDC's token API ([#27375](https://github.com/angular/components/pull/27375)) |
| [47876311b](https://github.com/angular/components/commit/47876311b46b62f034dbffcbfc88290a18f75e33) | fix | **slider:** Emit tokens under mixin root selector ([#27597](https://github.com/angular/components/pull/27597)) |
| [c572dc4bf](https://github.com/angular/components/commit/c572dc4bf4d48448699288aeac2be14db0186a86) | fix | **slider:** Move unthemable tokens to theme mixin ([#27584](https://github.com/angular/components/pull/27584)) |
| [6c724c713](https://github.com/angular/components/commit/6c724c713fb0510b32ce302a51f1d9d15df4b668) | fix | **snack-bar:** Emit tokens under mixin root selector ([#27667](https://github.com/angular/components/pull/27667)) |
| [65c97170d](https://github.com/angular/components/commit/65c97170d2b3d239fda25bd049ec417e0098fe12) | fix | **snack-bar:** Move unthemable tokens to theme mixin ([#27596](https://github.com/angular/components/pull/27596)) |
| [af1840209](https://github.com/angular/components/commit/af1840209f81dcf8011e88b7d98101ff72f0ad1c) | fix | **table:** move unthemable tokens to theme mixin ([#27890](https://github.com/angular/components/pull/27890)) |
| [59351724d](https://github.com/angular/components/commit/59351724dfef12961e2fdbbe12bf141af065e3a8) | fix | **tabs:** move unthemable tokens to theme mixin ([#27891](https://github.com/angular/components/pull/27891)) |
| [999029aa5](https://github.com/angular/components/commit/999029aa5a23e9577503775c1ea4513e5c3cb4f9) | fix | **theming:** Fix subtle bug in current-selector-or-root ([#27898](https://github.com/angular/components/pull/27898)) |
| [6cc6cf21f](https://github.com/angular/components/commit/6cc6cf21f292d78c930cbda79c1f337bd6b82bfe) | fix | **tooltip:** Emit tokens under mixin root selector ([#27585](https://github.com/angular/components/pull/27585)) |
| [ccd2d7fa7](https://github.com/angular/components/commit/ccd2d7fa72f4566ab2c2aeb78a5ac4b7d4149bbf) | fix | **tooltip:** Move unthemable tokens to theme mixin ([#27569](https://github.com/angular/components/pull/27569)) |
| [f7e3ae3bd](https://github.com/angular/components/commit/f7e3ae3bd1b86d5987df57bb06d350001c592931) | fix | remove legacy components ([#27622](https://github.com/angular/components/pull/27622)) |
### cdk
| Commit | Type | Description |
| -- | -- | -- |
| [b3e4d576b](https://github.com/angular/components/commit/b3e4d576b9f0060bb1110766d74c982e4620b2a6) | feat | **overlay:** add disposeOnNavigation ([#27672](https://github.com/angular/components/pull/27672)) |
| [2409e7071](https://github.com/angular/components/commit/2409e7071a4c1e035a6f212249e96ba36d7aeb4f) | fix | **schematics:** account for single string in styles and new styleUrl ([#27798](https://github.com/angular/components/pull/27798)) |
| [c5ab88020](https://github.com/angular/components/commit/c5ab88020154e6997c02a332ec5ecd09808fa52e) | fix | **schematics:** support both application and browser builders ([#27875](https://github.com/angular/components/pull/27875)) |
### multiple
| Commit | Type | Description |
| -- | -- | -- |
| [86e9e524c](https://github.com/angular/components/commit/86e9e524c3234f44eece21632048cd4290e5f3f4) | fix | remove .import.scss and -legacy-index.scss files ([#27571](https://github.com/angular/components/pull/27571)) |
| [55f9618b6](https://github.com/angular/components/commit/55f9618b687fc0da4743a3cf27e113ceb837e151) | fix | remove unnecessary base classes ([#27632](https://github.com/angular/components/pull/27632)) |
| [a3f9ca14b](https://github.com/angular/components/commit/a3f9ca14ba57a8e39f65858066b8681908f46590) | perf | switch to built-in control flow ([#27987](https://github.com/angular/components/pull/27987)) |
| [90465a188](https://github.com/angular/components/commit/90465a1882028144a8e56eabc03b4cc93947df9f) | refactor | convert components to theme inspection API (round 4) ([#27740](https://github.com/angular/components/pull/27740)) |

<!-- CHANGELOG SPLIT MARKER -->

# Changes Prior to 17.0.0

To view changes that occurred prior to 17.0.0, see [CHANGELOG_ARCHIVE.md](https://github.com/angular/components/blob/main/CHANGELOG_ARCHIVE.md).
