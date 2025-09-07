#########################################################
##### Extract Pitch, Intensity, and Spectrogram #########
#########################################################
clearinfo
form Parameters
	text directory
	text basename
endform

# Use "/" for the path separator for reliability
Read from file: directory$ + "/" + basename$ + ".wav"

# Variables for objects in Menu
sound$ = "Sound " + basename$
int$ = "Intensity " + basename$
pitch$ = "Pitch " + basename$

# Extract Intensity
To Intensity: 100, 0, "yes"

# Extract Pitch
selectObject: sound$
To Pitch: 0, 75, 600

# Save Intensity Object
selectObject: int$
# Use "/" for the path separator
Write to binary file: directory$ + "/" + basename$ + ".Intensity"

# Save Pitch Object
selectObject: pitch$
# Use "/" for the path separator
Write to binary file: directory$ + "/" + basename$ + ".Pitch"

# Clean Menu
select all
Remove