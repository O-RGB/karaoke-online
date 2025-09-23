AudioWorkletGlobalScope.myHookPlayerEvents = function (s, type, event, data) {
  if (type === 0xc0) {
    if (event.getProgram() === 0) {
      s.midiProgramSelect(event.getChannel(), data.secondSFont, 0, 0);
      return true;
    }
  }
  return false;
};
