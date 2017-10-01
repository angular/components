1. Fork Angular Material from [Angular Material](https://github.com/angular/material2).

2. Rename repo with your company's prefix -- ix-material or company-prefix-material.

3. Clone the repo.

4. Initialize git flow.  
   Requires git flow command line, which you can install with brew ( Mac ), or use source tree.
   
   ```bash

       brew install git-flow
    ```
    
    Then, initialize repo using default answers in wizard.
    
    ```bash
    
       git flow init
    ```

    
5. Create an upstream branch.

    ```bash
    
        git branch upstream
    ```

6. Add remote upstream url.

    ```bash
    
        git remote add upstream https://github.com/angular/material2.git
    ```

7. Add `.nvmrc` file in root directory. Add base node version you want to use.

8. Change package names of modules

    ```bash

    src/cdk/package.json
    src/lib/package.json
    src/material-examples/package.json
    src/material-moment-adapter/package.json
    ```
