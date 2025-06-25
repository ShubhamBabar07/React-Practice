import React, { useState, useCallback } from 'react';
import Joyride from 'react-joyride';
import { manualSteps } from './manualSteps';

const GettingStartedTour = () => {
  const GENERIC_COUNT = 7;

  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);

  const hasSeenGeneric = sessionStorage.getItem('seenGenericSteps') === 'true';
  const hasSeenAll = sessionStorage.getItem('seenAllSteps') === 'true';

  const splitSteps = () => {
    const generic = manualSteps.slice(0, GENERIC_COUNT);
    const contextual = manualSteps.slice(GENERIC_COUNT).filter(step => {
      return document.querySelector(step.target);
    });
    return { generic, contextual };
  };

  const startTour = useCallback(() => {
    const { generic, contextual } = splitSteps();

    // Case D: Reset if all seen
    if (hasSeenAll) {
      sessionStorage.removeItem('seenGenericSteps');
      sessionStorage.removeItem('seenAllSteps');
      setSteps([...generic, ...contextual]);
      setRun(true);
      return;
    }

    // Case A: Fresh session
    if (!hasSeenGeneric) {
      setSteps([...generic, ...contextual]);
      setRun(true);
      return;
    }

    // Case B: Generic seen, contextual present
    if (contextual.length > 0) {
      setSteps([...contextual]);
      setRun(true);
      return;
    }

    // Case C: No contextual steps, fallback to generic again
    setSteps([...generic]);
    setRun(true);
  }, [hasSeenGeneric, hasSeenAll]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if (['finished', 'skipped'].includes(status)) {
      const { generic, contextual } = splitSteps();

      // Mark generic as seen if shown
      if (steps.some(s => generic.find(g => g.target === s.target))) {
        sessionStorage.setItem('seenGenericSteps', 'true');
      }

      // Mark all as seen if all steps were shown
      const allShown =
        steps.length === manualSteps.filter(step => document.querySelector(step.target)).length;

      if (allShown) {
        sessionStorage.setItem('seenAllSteps', 'true');
      }

      setRun(false);
    }
  };

  return (
    <>
      <button onClick={startTour}>Getting Started</button>

      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{ options: { zIndex: 10000 } }}
      />
    </>
  );
};

export default GettingStartedTour;
