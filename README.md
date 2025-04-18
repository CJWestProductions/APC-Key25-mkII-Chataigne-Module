# APC Key 25 mk2 Chataigne Module
A Chataigne module for the Akai APC Key 25 mkII MIDI Controller
Based on the module for the APC Mini Mk2 by lenschcode

## Important Notes
- This module only implements the pads, buttons, and knobs, not the keyboard functions. Those come in on a separate MIDI connection. The "Sustain", "Oct-", and Oct+" keys are associated with that connection as well.
- In order to make the module work connect Midi in and out to the second MIDI port of the device (called MIDIIN2 or MIDIOUT2).
- Not all softkeys have LEDs. Stop All Clips, Shift, Play/Pause, and Record do not have LEDs, and thus cannot be lit

## Features
- All pads and softkeys mapped
- All Knobs maped
- Full RGB 14bit color feedback for pads
- Last state automatically restored on reconnect
- Extensive user commands
    - Force Resync
    - Set softkey LED States
    - Set pad LED Colors and pulsing on/off

## Changelog
### V 1.0.0:
- Full functionality is implemented
    - Softkeys and pads are all functional
    - LEDs all working
    - Commands are all tested
- Testing, Bug-fixes, and cleanup

### V 0.2.0:
- Colors for pads are implemented, with full RGB control.
- Pulsing of pads is also working, as a result of the above.

### V 0.1.0:
- Start work, migrating code from APC mini module by Lenschcode
- Knobs are fully implemented
- Pads read correctly, colors not working
- Other softkeys are not working