// We need to configure AMD modules which are not named because otherwise "require.js" is not
// able to resolve AMD imports to such modules.
require.config({});

// Workaround until https://github.com/angular/components/issues/13883 has been addressed.
var module = {id: ''};
