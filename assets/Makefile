# Makefile for assets

PYTHON=python
LAME=lame

ASSETS=sounds/jump.mp3 sounds/pick.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(LAME) $< $@
