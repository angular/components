/**
 * @fileoverview Class providing common dependencies for the extension's
 * bottom half.
 */
'use strict';

/**
 * @param {!GnubbyFactory} gnubbyFactory A Gnubby factory.
 * @param {!CountdownFactory} countdownFactory A countdown timer factory.
 * @param {!IndividualAttestation} individualAttestation An individual
 *     attestation implementation.
 * @constructor
 */
function DeviceFactoryRegistry(gnubbyFactory, countdownFactory,
    individualAttestation) {
  /** @private {!GnubbyFactory} */
  this.gnubbyFactory_ = gnubbyFactory;
  /** @private {!CountdownFactory} */
  this.countdownFactory_ = countdownFactory;
  /** @private {!IndividualAttestation} */
  this.individualAttestation_ = individualAttestation;
}

/** @return {!GnubbyFactory} A Gnubby factory. */
DeviceFactoryRegistry.prototype.getGnubbyFactory = function() {
  return this.gnubbyFactory_;
};

/** @return {!CountdownFactory} A countdown factory. */
DeviceFactoryRegistry.prototype.getCountdownFactory = function() {
  return this.countdownFactory_;
};

/** @return {!IndividualAttestation} An individual attestation implementation.
 */
DeviceFactoryRegistry.prototype.getIndividualAttestation = function() {
  return this.individualAttestation_;
};
