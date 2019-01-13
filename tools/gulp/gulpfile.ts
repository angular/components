import {createPackageBuildTasks} from '../package-tools';
import {
  cdkExperimentalPackage,
  cdkPackage,
  googleMapsPackage,
  materialExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  luxonAdapterPackage,
  youTubePlayerPackage,
} from './packages';

import './tasks/ci';
import './tasks/clean';
import './tasks/unit-test';

createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(cdkExperimentalPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(materialExperimentalPackage);
createPackageBuildTasks(momentAdapterPackage);
createPackageBuildTasks(luxonAdapterPackage);
createPackageBuildTasks(youTubePlayerPackage);
createPackageBuildTasks(googleMapsPackage);

