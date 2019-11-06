# Components and Material Design for Angular
[![npm version](https://badge.fury.io/js/%40angular%2Fmaterial.svg)](https://www.npmjs.com/package/%40angular%2Fmaterial)
[![Build status](https://circleci.com/gh/angular/components.svg?style=svg)](https://circleci.com/gh/angular/components)
[![Gitter](https://badges.gitter.im/angular/components.svg)](https://gitter.im/angular/material2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This is the home for the Angular team's UI components built for and with Angular.
These include Material Design components and the Angular Component Development Kit (CDK).

#### Quick links
[Documentation, demos, and guides][aio] |
[Google group](https://groups.google.com/forum/#!forum/angular-material2) |
[Contributing](https://github.com/angular/components/blob/master/CONTRIBUTING.md) |
[StackBlitz Template](https://stackblitz.com/fork/components-issue)

### Getting started

See our [Getting Started Guide][getting-started]
if you're building your first project with Angular Material.

Check out our [directory of design documents](https://github.com/angular/components/wiki/Design-doc-directory)
for more insight into our process.

If you'd like to contribute, you must follow our [contributing guidelines](https://github.com/angular/components/blob/master/CONTRIBUTING.md).
You can look through the GitHub issues (which should be up-to-date on who is working on which features
and which pieces are blocked) and make a comment.

Please see our [`help wanted`](https://github.com/angular/components/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
label for a list of issues where we could use help from the community.

#### High level stuff planned for Q4 2019 (Oct  - Nov):
* Remove dependency on HammerJS
* Finish remaining test harnesses for Angular Material components
* Continuing to create new, API-compatible versions of the Angular Material components backed by
MDC Web ([see @jelbourn's ng-conf talk](https://youtu.be/4EXQKP-Sihw?t=891)).
* New `@angular/google-maps` package
* New `@angular/cdk/clipboard` subpackage


#### Available features

| Feature          | Notes                                                  | Docs         |
|------------------|--------------------------------------------------------|--------------|
| autocomplete     |                                                        |   [Docs][24] |
| badge            |                                                        |   [Docs][37] |
| bottom-sheet     |                                                        |   [Docs][38] |
| button           |                                                        |   [Docs][1]  |
| button-toggle    |                                                        |   [Docs][15] |
| cards            |                                                        |   [Docs][2]  |
| checkbox         |                                                        |   [Docs][3]  |
| chips            |                                                        |   [Docs][26] |
| data-table       |                                                        |   [Docs][28] |
| datepicker       |                                                        |   [Docs][25] |
| dialog           |                                                        |   [Docs][22] |
| divider          |                                                        |   [Docs][35] |
| drag-drop        |                                                        |   [Docs][39] |
| expansion-panel  |                                                        |   [Docs][32] |
| grid-list        |                                                        |   [Docs][9]  |
| icon             |                                                        |   [Docs][10] |
| input            |                                                        |   [Docs][5]  |
| list             |                                                        |   [Docs][8]  |
| menu             |                                                        |   [Docs][17] |
| paginator        |                                                        |   [Docs][29] |
| progress-bar     |                                                        |   [Docs][12] |
| progress-spinner |                                                        |   [Docs][11] |
| radio            |                                                        |   [Docs][4]  |
| ripples          |                                                        |   [Docs][19] |
| select           |                                                        |   [Docs][23] |
| sidenav          |                                                        |   [Docs][6]  |
| slide-toggle     |                                                        |   [Docs][14] |
| slider           |                                                        |   [Docs][16] |
| snackbar / toast |                                                        |   [Docs][21] |
| sort-header      |                                                        |   [Docs][30] |
| stepper          |                                                        |   [Docs][33] |
| tabs             |                                                        |   [Docs][13] |
| textarea         |                                                        |   [Docs][5]  |
| toolbar          |                                                        |   [Docs][7]  |
| tooltip          |                                                        |   [Docs][18] |
| tree             |                                                        |   [Docs][36] |
| virtual-scroll   |                                                        |   [Docs][40] |
| ---------------- | ------------------------------------------------------ | ------------ |
| theming          |                                                        |  [Guide][20] |
| typography       |                                                        |  [Guide][27] |
| layout           | See [CDK Layout][cdk-layout] or [@angular/flex-layout][lay_rp]| -     |
| cdk              |                                                        |   [Docs][34] |

 [1]: https://material.angular.io/components/button/overview
 [2]: https://material.angular.io/components/card/overview
 [3]: https://material.angular.io/components/checkbox/overview
 [4]: https://material.angular.io/components/radio/overview
 [5]: https://material.angular.io/components/input/overview
 [6]: https://material.angular.io/components/sidenav/overview
 [7]: https://material.angular.io/components/toolbar/overview
 [8]: https://material.angular.io/components/list/overview
 [9]: https://material.angular.io/components/grid-list/overview
[10]: https://material.angular.io/components/icon/overview
[11]: https://material.angular.io/components/progress-spinner/overview
[12]: https://material.angular.io/components/progress-bar/overview
[13]: https://material.angular.io/components/tabs/overview
[14]: https://material.angular.io/components/slide-toggle/overview
[15]: https://material.angular.io/components/button-toggle/overview
[16]: https://material.angular.io/components/slider/overview
[17]: https://material.angular.io/components/menu/overview
[18]: https://material.angular.io/components/tooltip/overview
[19]: https://github.com/angular/components/blob/master/src/material/core/ripple/ripple.md
[20]: https://material.angular.io/guide/theming
[21]: https://material.angular.io/components/snack-bar/overview
[22]: https://material.angular.io/components/dialog/overview
[23]: https://material.angular.io/components/select/overview
[24]: https://material.angular.io/components/autocomplete/overview
[25]: https://material.angular.io/components/datepicker/overview
[26]: https://material.angular.io/components/chips/overview
[27]: https://material.angular.io/guide/typography
[28]: https://material.angular.io/components/table/overview
[29]: https://material.angular.io/components/paginator/overview
[30]: https://material.angular.io/components/sort/overview

[32]: https://material.angular.io/components/expansion/overview
[33]: https://material.angular.io/components/stepper/overview
[34]: https://material.angular.io/cdk/categories
[35]: https://material.angular.io/components/divider/overview
[36]: https://material.angular.io/components/tree/overview
[37]: https://material.angular.io/components/badge/overview
[38]: https://material.angular.io/components/bottom-sheet/overview
[39]: https://material.angular.io/cdk/drag-drop/overview
[40]: https://material.angular.io/cdk/scrolling/overview#virtual-scrolling

[aio]: https://material.angular.io
[getting-started]: https://material.angular.io/guide/getting-started
[lay_rp]:  https://github.com/angular/flex-layout
[cdk-layout]: https://material.angular.io/cdk/layout/overview


## The goal of Angular Material and the CDK
Our goal is to build a set of high-quality UI components built with Angular and TypeScript.
These include foundational components and services, found in the CDK, and components that follow
the Material Design spec. These components serve as an example of how to build Angular UI components
that follow best practices.

### What do we mean by "high-quality"?
* Internationalized and accessible so that all users can use them.
* Straightforward APIs that don't confuse developers.
* Behave as expected across a wide variety of use-cases without bugs.
* Behavior is well-tested with both unit and integration tests.
* Customizable within the bounds of the Material Design specification.
* Performance cost is minimized.
* Code is clean and well-documented to serve as an example for Angular developers.

## Browser and screen reader support
Angular Material supports the most recent two versions of all major browsers:
Chrome (including Android), Firefox, Safari (including iOS), and IE11 / Edge.

We aim for great user experience with the following screen readers:
* **Windows**: NVDA and JAWS with IE11 / FF / Chrome.
* **macOS**: VoiceOver with Safari / Chrome.
* **iOS**: VoiceOver with Safari
* **Android**: Android Accessibility Suite (formerly TalkBack) with Chrome.
* **Chrome OS**: ChromeVox with Chrome.

Apache License
                           Version 2.0, January 2004
                        https://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2019 Rolando Gopez Lacuata.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
