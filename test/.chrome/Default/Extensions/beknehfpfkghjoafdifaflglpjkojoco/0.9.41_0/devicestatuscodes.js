/**
 * @fileoverview This file defines the status codes returned by the device.
 */

/**
 * Status codes returned by the gnubby device.
 * @const
 * @enum {number}
 * @export
 */
var DeviceStatusCodes = {};

/**
 * Device operation succeeded.
 * @const
 */
DeviceStatusCodes.OK_STATUS = 0;

/**
 * Device operation wrong length status.
 * @const
 */
DeviceStatusCodes.WRONG_LENGTH_STATUS = 0x6700;

/**
 * Device operation wait touch status.
 * @const
 */
DeviceStatusCodes.WAIT_TOUCH_STATUS = 0x6985;

/**
 * Device operation invalid data status.
 * @const
 */
DeviceStatusCodes.INVALID_DATA_STATUS = 0x6984;

/**
 * Device operation wrong data status.
 * @const
 */
DeviceStatusCodes.WRONG_DATA_STATUS = 0x6a80;

/**
 * Device operation timeout status.
 * @const
 */
DeviceStatusCodes.TIMEOUT_STATUS = -5;

/**
 * Device operation busy status.
 * @const
 */
DeviceStatusCodes.BUSY_STATUS = -6;

/**
 * Device removed status.
 * @const
 */
DeviceStatusCodes.GONE_STATUS = -8;
