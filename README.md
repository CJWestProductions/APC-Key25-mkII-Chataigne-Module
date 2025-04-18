# APC Key 25 mk2 Chataigne Module
A Chataigne module for the Akai APC Key 25 mkII MIDI Controller
Based on the module for the APC Mini Mk2 by lenschcode

## Important Notes
This module only implements the pads, buttons, and knobs, not the keyboard functions. Those come in on a separate MIDI connection. The "Sustain", "Oct-", and Oct+" keys are associated with that connection as well.
In order to make the module work connect Midi in and out to the second MIDI device caled APC key 25 mk2.

## Features
- All pads mapped
- All Knobs maped
- Full RGB 14bit color feedback for pads
- TODO: small button functionality
- Last state automatically restored on reconnect
- Partial: Extensive user commands

## Changelog
### V 0.2.0:
- Colors for pads are implemented, with full RGB control.
- Pulsing of pads is also working, as a result of the above.

### V 0.1.0:
- Start work, migrating code from APC mini module by Lenschcode
- Knobs are fully implemented
- Pads read correctly, colors not working
- Other softkeys are not working