#########################################################
##### Extract Pitch, Intensity, and Spectrogram #########
#########################################################
clearinfo
form Parameters
	text directory
	text basename
endform

Read from file: directory$ + basename$ + ".wav"

# Variables for objects in Menu
sound$ = "Sound " + basename$
int$ = "Intensity " + basename$
pitch$ = "Pitch " + basename$
#spec$ = "Spectrogram " + basename$

# Extract Intensity
To Intensity: 100, 0, "yes"

# Extract Pitch
selectObject: sound$
To Pitch: 0, 75, 600

# Extract Spectrogram
#selectObject: sound$
#To Spectrogram: 0.01, 5000, 0.005, 10, "Gaussian"

# Save Intensity Object
selectObject: int$
Write to binary file: directory$ + basename$ + ".Intensity"

# Save Pitch Object
selectObject: pitch$
Write to binary file: directory$ + basename$ + ".Pitch"

# Save Spectrogram Object
#selectObject: spec$
#Write to binary file: directory$ + basename$ + ".Spectrogram"

# Clean Menu
select all
Remove

#appendInfoLine: "Pitch, intensity, and spectrogram objects have been created. File: ", basename$

#################### END OF MODULE ######################
