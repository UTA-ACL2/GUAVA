#########################################################
##### MODULE PITCH, INTENSITY, SPECTROGRAM ##########
#########################################################
clearinfo
form Parameters
	text directory
	text basename
endform

# Use "/" for path separators
Read from file: directory$ + "/" + basename$ + ".Intensity"
Read from file: directory$ + "/" + basename$ + ".Pitch"

# objects in Menu
pitch$ = "Pitch " + basename$
int$ = "Intensity " + basename$

selectObject: pitch$

start = Get start time
end = Get end time

# Use "/" for path and ensure the header is written correctly
writeFileLine: directory$ + "/" + basename$ + ".graph", "time", tab$, "pitch", tab$, "intensity"
i = start
while i <= end
	selectObject: pitch$
	resPitch = Get value at time: i, "Hertz", "Linear"
	selectObject: int$
	resInt = Get value at time: i, "Cubic"
	# FIX: Combined the command onto a single line and used "/" for the path
	appendFileLine: directory$ + "/" + basename$ + ".graph", fixed$ (i, 3), tab$, fixed$ (resPitch, 2), tab$, fixed$ (resInt, 2)
	i = i + 0.01
endwhile